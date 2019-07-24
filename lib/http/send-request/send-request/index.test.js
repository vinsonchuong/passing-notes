/* @flow */
import test from 'ava'
import { startServer, stopServer } from 'passing-notes/lib/node'
import sendRequest from 'passing-notes/lib/http/send-request'

test('sending an HTTP request', async t => {
  process.env.PORT = '10030'

  const server = await startServer(10030, (request, response) => {
    response.end('Hello World!')
  })

  const response = await sendRequest({
    method: 'GET',
    headers: {},
    url: '/',
    body: ''
  })

  t.deepEqual(response, {
    status: 200,
    headers: {},
    body: 'Hello World!'
  })

  await stopServer(server)
})
