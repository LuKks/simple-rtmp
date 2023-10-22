#!/usr/bin/env node

const { Command } = require('commander')
const goodbye = require('graceful-goodbye')
const HypercoreId = require('hypercore-id-encoding')
const StreamingClient = require('../client.js')
// const exit = require('../lib/exit.js')

const program = new Command()

program
  .description('Start live streaming')
  .argument('<key>', 'Server public key')
  .option('--port <number>', 'Bind to port')
  .action(cmd)
  .parseAsync()

async function cmd (serverPublicKey, options = {}) {
  serverPublicKey = HypercoreId.decode(serverPublicKey)

  const client = new StreamingClient(serverPublicKey, {
    port: options.port || 1935
  })
  await client.ready()

  const listening = client.address()
  console.log('Custom server', getHost(listening.address) + ':' + listening.port)

  goodbye(() => client.close())
}

function getHost (address) {
  if (address === '::' || address === '0.0.0.0') return 'localhost'
  return address
}
