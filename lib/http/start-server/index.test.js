/* @flow */
import test from 'ava'
import { startServer, stopServer } from 'passing-notes/lib/http'
import { sendRequest } from 'passing-notes'

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
