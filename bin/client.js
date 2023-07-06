const goodbye = require('graceful-goodbye')
const b4a = require('b4a')
const StreamingClient = require('../client.js')
// const exit = require('../lib/exit.js')

module.exports = async function cmd (serverPublicKey, options = {}) {
  serverPublicKey = b4a.from(serverPublicKey, 'hex')

  const client = new StreamingClient(serverPublicKey, {
    port: options.port
  })
  await client.ready()

  console.log(client.address())

  goodbye(() => client.close())
}

/*
const fs = require('fs')
const StreamingServer = require('./index.js')

main()

async function main () {
  const server = new StreamingServer({
    auth: {
      publish: true,
      secret: 'c5439ae2090cb2d6cc6eaf651ac90b5dc8c1d3cc'
    },
    ssl: {
      cert: fs.readFileSync('/etc/letsencrypt/live/tv.leet.ar/fullchain.pem'),
      key: fs.readFileSync('/etc/letsencrypt/live/tv.leet.ar/privkey.pem')
    }
  })
  await server.ready()

  console.log(server.address())

  const expires = Date.now() + (24 * 60 * 60 * 1000)
  console.log('sign', server.sign('lukks', expires))
}
*/
