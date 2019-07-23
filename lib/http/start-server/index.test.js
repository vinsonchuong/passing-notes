/* @flow */
import test from 'ava'
import { startServer, stopServer } from 'passing-notes/lib/http'
import { sendRequest } from 'passing-notes'
import { fromWebSocket } from 'heliograph'
import WebSocket from 'ws'

test('starting an HTTP server', async t => {
  const server = await startServer(10012, (request, response) => {
    response.writeHead(200, {
      'content-type': 'text/plain'
    })
    response.end('Hello World!')
  })

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10012',
    headers: {},
    body: ''
  })

  t.is(response.body, 'Hello World!')

  await stopServer(server)
})

test('handling both HTTP requests and upgrades to WebSocket', async t => {
  const webSocketServer = new WebSocket.Server({ noServer: true })
  webSocketServer.on('connection', webSocket => {
    webSocket.on('message', message => {
      t.is(message, 'Ping')
      webSocket.send('Pong')
    })
  })

  const server = await startServer(
    10013,
    (request, response) => {
      response.writeHead(200, {
        'content-type': 'text/plain'
      })
      response.end('This is HTTP!')
    },
    (request, socket, head) => {
      webSocketServer.handleUpgrade(request, socket, head, webSocket => {
        webSocketServer.emit('connection', webSocket, request)
      })
    }
  )

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10013',
    headers: {},
    body: ''
  })
  t.is(response.body, 'This is HTTP!')

  const clientSocket = await fromWebSocket('ws://localhost:10013')
  clientSocket.send('Ping')
  clientSocket.close()
  t.is((await clientSocket.next()).value, 'Pong')

  await stopServer(server)
})
