const http = require('http')
const https = require('https')
const DHT = require('hyperdht')
const crypto = require('crypto')
const ReadyResource = require('ready-resource')
const safetyCatch = require('safety-catch')
const NodeRtmpSession = require('node-media-server/src/node_rtmp_session.js')
const NodeFlvSession = require('node-media-server/src/node_flv_session.js')
const { serverListen, serverClose } = require('./lib/server-helpers.js')

module.exports = class StreamingServer extends ReadyResource {
  constructor (opts = {}) {
    super()

    this.port = typeof opts.port !== 'undefined' ? Number(opts.port) : 1935
    this.host = typeof opts.host !== 'undefined' ? opts.host : null

    this.auth = {
      play: !!opts.auth?.play,
      publish: !!opts.auth?.publish,
      secret: opts.auth?.secret || null
    }

    this.dht = new DHT({ seed: opts.seed })
    this.serverPublish = this.dht.createServer()
    this.serverPublish.on('connection', this._onpublishconnection.bind(this))

    this.playConnections = new Set()
    this.serverPlay = opts.ssl ? https.createServer({ ...opts.ssl }) : http.createServer()
    this.serverPlay.on('connection', this._onplayconnection.bind(this))
    this.serverPlay.on('request', this._onplayrequest.bind(this))

    this.ready().catch(safetyCatch)
  }

  async _open () {
    await this.serverPublish.listen()
    await serverListen(this.serverPlay, this.port, this.host)
  }

  async _close () {
    await this.serverPublish.close()
    await serverClose(this.serverPlay, this.playConnections)
  }

  get publicKey () {
    return this.serverPublish.publicKey
  }

  _onpublishconnection (socket) {
    // Patch due not having cork/uncork
    socket.cork = noop
    socket.uncork = noop

    // Patch so RTMP doesn't think it's local due auth
    socket.remoteAddress = '1.2.3.4'

    const config = {
      rtmp: {
        chunk_size: 128,
        ping: 60,
        ping_timeout: 30,
        gop_cache: true
      },
      auth: { ...this.auth }
    }

    const session = new NodeRtmpSession(config, socket)
    session.run()
  }

  _onplayconnection (socket) {
    this.playConnections.add(socket)
    socket.on('close', () => this.playConnections.delete(socket))
  }

  _onplayrequest (req, res) {
    // Patch so RTMP doesn't think it's local due auth
    req.socket.remoteAddress = '1.2.3.4'

    const config = {
      auth: { ...this.auth }
    }

    req.nmsConnectionType = 'http'

    const session = new NodeFlvSession(config, req, res)
    session.run()
  }

  sign (name, expires) {
    if (!this.auth.secret) return null

    return expires + '-' + createHash('md5', '/live/' + name + '-' + expires + '-' + this.auth.secret)
  }
}

function createHash (algo, text) {
  return crypto.createHash(algo).update(text).digest('hex')
}

function noop () {}
