const os = require('os')
const path = require('path')

module.exports = {
  USERDIR: path.join(os.homedir(), '.simple-rtmp')
}
