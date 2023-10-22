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

  const server = new StreamingServer({
    seed,
    auth: {
      publish: true,
      secret: authSecret
    },
    host: options.host,
    port: options.port || 8035,
    ssl: options.cert && options.key ? { cert: options.cert, key: options.key } : null
  })
  await server.ready()

  console.log('Server public key:', HypercoreId.encode(server.publicKey))

  goodbye(() => server.close())
}
