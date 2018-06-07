/* @flow */
import test from 'ava'
import { startServer, stopServer, liftResponder } from 'passing-notes/lib/http'
import { sendRequest } from 'passing-notes'

test('adapting a functional responder to a Node request handler', async t => {
  const server = await startServer(
    10050,
    liftResponder(request => {
      t.is(request.method, 'POST')
      t.is(request.url, '/path')
      t.is(request.headers['x-request'], 'Hello')
      t.falsy(request.headers.connection)
      t.is(request.body, 'Some Data')

      return {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-response': 'World!'
        },
        body: JSON.stringify({ hello: 'world' })
      }
    })
  )

  const response = await sendRequest({
    method: 'POST',
    url: 'http://localhost:10050/path',
    headers: {
      'x-request': 'Hello'
    },
    body: 'Some Data'
  })

  t.is(response.status, 200)
  t.is(response.headers['x-response'], 'World!')
  t.deepEqual(response.body, { hello: 'world' })

  await stopServer(server)
})

test('correctly handling empty bodies', async t => {
  t.plan(1)

  const server = await startServer(
    10051,
    liftResponder(request => {
      t.is(request.body, null)
      return { status: 200, headers: {}, body: null }
    })
  )

  await sendRequest({
    method: 'GET',
    url: 'http://localhost:10051',
    headers: {},
    body: null
  })

  await stopServer(server)
})
