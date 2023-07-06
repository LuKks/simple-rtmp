#!/usr/bin/env node

const { Command } = require('commander')

const server = require('./bin/server.js')
const client = require('./bin/client.js')
// const watcher = require('./bin/watcher.js')

const program = new Command()

program
  .description('')

program.command('server')
  .description('Create a RTMP server')
  .action(server)

program.command('client')
  .description('Start live streaming')
  .argument('<key>', 'Server public key')
  .option('--port <number>', 'Bind to port')
  .action(client)

/* program.command('watcher')
  .description('Watch a stream')
  .action(watcher) */

program.parseAsync()
