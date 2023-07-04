const net = require('net')
const ReadyResource = require('ready-resource')
const RTMP = require('node-media-server/src/node_rtmp_session.js')

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

    this.server = net.createServer()
    this.server.on('connection', this._onconnection.bind(this))

    this.connections = new Set()
    this.sessions = new Set()
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
    const session = new RTMP({
      rtmp: {
        chunk_size: 128,
        ping: 60,
        ping_timeout: 30,
        gop_cache: true
      },
      auth: { ...this.auth }
    }, socket)

    this.sessions.add(session)
    socket.on('close', () => this.sessions.delete(session))

    session.run()
  }
}

function serverListen (server, port, address) {
  return new Promise((resolve, reject) => {
    server.on('listening', done)
    server.on('error', done)

    if (address) server.listen(port, address)
    else server.listen(port)

    function done (err) {
      server.off('listening', done)
      server.off('error', done)

      if (err) reject(err)
      else resolve()
    }
  })
}

function serverClose (server, connections) {
  return new Promise(resolve => {
    let waiting = 1
    server.close(onclose)

    if (connections) {
      for (const c of connections) {
        waiting++
        c.on('close', onclose)
        c.destroy()
      }
    }

    function onclose () {
      if (--waiting === 0) resolve()
    }
  })
}
