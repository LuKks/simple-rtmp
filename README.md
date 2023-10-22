# simple-rtmp

RTMP tools for real-time streaming

```
npm i -g simple-rtmp
```

## Server

Run the main server

```sh
simple-rtmp-server [--port 8035] [--host 0.0.0.0] [--cert <fullchain.pem>] [--key <privkey.pem>]
```

Create a stream key for a streamer

```sh
simple-rtmp-keygen <name> [--expires <ms>]
```

## Client

A streamer runs the client which is a local server

```sh
simple-rtmp <server-key> [--port 1935]
```

In OBS or equivalent, configure it like `rtmp://localhost:1935/live`, also set the stream key

When the stream starts, this will transmit to the main server

## Watcher

Anyone can access to any stream like so `http://<main-server-ip>:1935/live/<name>.flv`

You could generate a SSL certificate, and use the lib pro-flv.js in the browser

## License

MIT
