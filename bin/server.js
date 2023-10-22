#!/usr/bin/env node

const { Command } = require('commander')
const goodbye = require('graceful-goodbye')
const HypercoreId = require('hypercore-id-encoding')
const StreamingServer = require('../server.js')
const filegen = require('../lib/filegen.js')

const program = new Command()

program
  .description('Create a RTMP server')
  .option('--port <number>', 'Port')
  .option('--cert <fullchain.pem>', 'Path to the fullchain .pem file')
  .option('--key <privkey.pem>', 'Path to the private key .pem file')
  .action(cmd)
  .parseAsync()

async function cmd (options = {}) {
  const seed = filegen('server-seed')
  const authSecret = HypercoreId.encode(filegen('server-auth-secret'))
  const ssl = options.cert && options.key ? { cert: options.cert, key: options.key } : null

  const server = new StreamingServer({
    seed,
    auth: {
      publish: true,
      secret: authSecret
    },
    host: options.host,
    port: options.port || 8035,
    ssl
  })
  await server.ready()

  console.log('Server public key:', HypercoreId.encode(server.publicKey))

  const listening = server.serverPlay.address()
  console.log('HTTP server', (ssl ? 'https' : 'http') + '://' + getHost(listening.address) + ':' + listening.port)

  goodbye(() => server.close())
}

function getHost (address) {
  if (address === '::' || address === '0.0.0.0') return 'localhost'
  return address
}
