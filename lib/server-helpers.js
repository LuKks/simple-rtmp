module.exports = {
  serverListen,
  serverClose
}

function serverListen (server, port, address) {
  return new Promise((resolve, reject) => {
    server.on('listening', done)
    server.on('error', done)

    if (address) server.listen(port, address)
    else server.listen(port)

    function done (err) {
      server.off('listening', done)
      server.off('error', done)

      if (err) reject(err)
      else resolve()
    }
  })
}

function serverClose (server, connections) {
  return new Promise(resolve => {
    let waiting = 1
    server.close(onclose)

    if (connections) {
      for (const c of connections) {
        waiting++
        c.on('close', onclose)
        c.destroy()
      }
    }

    function onclose () {
      if (--waiting === 0) resolve()
    }
  })
}
