/* @flow */
import test from 'ava'
import { startServer, stopServer } from 'passing-notes/lib/node'
import { sendRequest } from 'passing-notes/lib/http'
import { lift } from 'passing-notes/lib/http/respond-to-requests'
import intoStream from 'into-stream'

test('adapting a functional responder to a Node request handler', async t => {
  const server = await startServer(
    10050,
    lift(async request => {
      t.is(request.method, 'POST')
      t.is(request.url, '/path')
      t.is(request.headers['x-request'], 'Hello')
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
  t.deepEqual(response.body, JSON.stringify({ hello: 'world' }))

  await stopServer(server)
})

test('correctly handling empty bodies', async t => {
  t.plan(1)

  const server = await startServer(
    10051,
    lift(async request => {
      t.is(request.body, '')
      return { status: 200, headers: {}, body: '' }
    })
  )

  await sendRequest({
    method: 'GET',
    url: 'http://localhost:10051',
    headers: {},
    body: ''
  })

  await stopServer(server)
})

test('allowing response body to be a Buffer', async t => {
  const server = await startServer(
    10052,
    lift(async request => ({
      status: 200,
      headers: {
        'content-type': 'text/plain'
      },
      body: Buffer.from('Hello World!')
    }))
  )

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10052/',
    headers: {},
    body: ''
  })

  t.is(response.body, 'Hello World!')

  await stopServer(server)
})

test('allowing response body to be a Stream', async t => {
  const server = await startServer(
    10053,
    lift(async request => ({
      status: 200,
      headers: {
        'content-type': 'text/plain'
      },
      body: intoStream('Hello World!')
    }))
  )

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10053/',
    headers: {},
    body: ''
  })

  t.is(response.body, 'Hello World!')

  await stopServer(server)
})
