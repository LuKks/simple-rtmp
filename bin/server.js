const goodbye = require('graceful-goodbye')
const b4a = require('b4a')
const StreamingServer = require('../server.js')
// const exit = require('../lib/exit.js')

module.exports = async function cmd (options = {}) {
  const server = new StreamingServer({
    seed: b4a.from('6391a84db448a94747bfe2fda82c73e2e07f1448f4b52e9ee2d167c93b68c490', 'hex'),
    auth: {
      publish: true,
      secret: 'c5439ae2090cb2d6cc6eaf651ac90b5dc8c1d3cc'
    }
  })
  await server.ready()

  console.log(server.publicKey.toString('hex'))

  const expires = Date.now() + (30 * 24 * 60 * 60 * 1000)
  console.log('sign', server.sign('lukks', expires))

  goodbye(() => server.close())
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
