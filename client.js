const net = require('net')
const DHT = require('hyperdht')
const pump = require('pump')
const b4a = require('b4a')
const ReadyResource = require('ready-resource')
const safetyCatch = require('safety-catch')
const { serverListen, serverClose } = require('./lib/server-helpers.js')

module.exports = class StreamingClient extends ReadyResource {
  constructor (serverPublicKey, opts = {}) {
    super()

    this.serverPublicKey = b4a.toBuffer(serverPublicKey)
    this.port = typeof opts.port !== 'undefined' ? Number(opts.port) : 1935
    this.host = typeof opts.host !== 'undefined' ? opts.host : null

    this.dht = new DHT()

    this.server = net.createServer()
    this.server.on('connection', this._onconnection.bind(this))

    this.ready().catch(safetyCatch)
  }

  async _open () {
    await serverListen(this.server, this.port, this.host)
  }

  async _close () {
    await serverClose(this.server, this.connections)
  }

  address () {
    return this.opened ? this.server.address() : null
  }

  _onconnection (socket) {
    pump(socket, this.dht.connect(this.serverPublicKey), socket)
  }
}
