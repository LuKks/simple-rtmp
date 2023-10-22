#!/usr/bin/env node

const { Command } = require('commander')
const HypercoreId = require('hypercore-id-encoding')
const StreamingServer = require('../server.js')
const filegen = require('../lib/filegen.js')

const STREAM_KEY_EXPIRATION_USR = 365 * 24 * 60 * 60 * 1000

const program = new Command()

program
  .description('Generate a stream key given a name')
  .argument('<name>', 'Name (e.g. streamer username)')
  .option('--expires <number>', 'Expiration in ms (default: 1 year)')
  .action(cmd)
  .parseAsync()

async function cmd (name, options = {}) {
  const authSecret = HypercoreId.encode(filegen('server-auth-secret'))
  const sign = StreamingServer.sign(name, Date.now() + (options.expires || STREAM_KEY_EXPIRATION_USR), authSecret)

  console.log('Stream key:', name + '?sign=' + sign)
}
