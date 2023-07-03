const StreamingServer = require('./index.js')

main()

async function main () {
  const server = new StreamingServer()
  await server.ready()

  console.log(server.address())
}
