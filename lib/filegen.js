const fs = require('fs')
const path = require('path')
const HypercoreId = require('hypercore-id-encoding')
const crypto = require('hypercore-crypto')
const { USERDIR } = require('../constants.js')

module.exports = function filegen (name) {
  const filename = path.join(USERDIR, name)

  if (!fs.existsSync(filename)) {
    const seed = crypto.randomBytes(32)
    fs.mkdirSync(path.dirname(filename), { recursive: true })
    fs.writeFileSync(filename, HypercoreId.encode(seed) + '\n', { flag: 'wx', mode: '600' })
  }

  return HypercoreId.decode(fs.readFileSync(filename, 'utf8').trim())
}
