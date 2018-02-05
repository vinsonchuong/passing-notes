/* @flow */
import test from 'ava'
import { startServer, stopServer, sendRequest } from 'passing-notes/src/http'
import { liftResponder } from 'passing-notes/src/http/respond-to-requests'

test('adapting a functional responder to a Node request handler', async t => {
  const server = await startServer(
    10050,
    liftResponder(request => {
      t.is(request.method, 'GET')
      t.is(request.url, '/path')
      t.is(request.headers['x-request'], 'Hello')
      t.falsy(request.headers.connection)

      return {
        status: 200,
        headers: {
          'x-response': 'World!'
        },
        body: JSON.stringify({ hello: 'world' })
      }
    })
  )

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10050/path',
    headers: {
      'x-request': 'Hello'
    }
  })

  t.is(response.status, 200)
  t.is(response.headers['x-response'], 'World!')
  t.deepEqual(response.body, { hello: 'world' })

  await stopServer(server)
})
