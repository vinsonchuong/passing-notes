/* @flow */
import test from 'ava'
import { startServer, stopServer } from 'passing-notes/lib/http'
import { sendRequest, respondToRequests } from 'passing-notes'

test('responding to requests', async t => {
  t.plan(2)

  const server = await startServer(
    10040,
    respondToRequests(next => request => {
      t.deepEqual(request, {
        method: 'POST',
        url: 'http://localhost:10040/path',
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          'x-request': 'Hello'
        },
        body: {
          message: 'Ping'
        }
      })

      return {
        status: 200,
        headers: {
          'x-response': 'World!',
          'content-type': 'application/json'
        },
        body: {
          message: 'Pong'
        }
      }
    })
  )

  const response = await sendRequest({
    method: 'POST',
    url: 'http://localhost:10040/path',
    headers: {
      'content-type': 'application/json',
      'x-request': 'Hello'
    },
    body: JSON.stringify({
      message: 'Ping'
    })
  })

  t.deepEqual(response, {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'x-response': 'World!'
    },
    body: {
      message: 'Pong'
    }
  })

  await stopServer(server)
})

test('responding 404 when no middleware are specified', async t => {
  const server = await startServer(10041, respondToRequests())

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10041/path',
    headers: {},
    body: ''
  })

  t.deepEqual(response, { status: 404, headers: {}, body: '' })

  await stopServer(server)
})

test('responding 404 when no middleware respond', async t => {
  const server = await startServer(10042, respondToRequests(next => next))

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10042/path',
    headers: {},
    body: ''
  })

  t.deepEqual(response, { status: 404, headers: {}, body: '' })

  await stopServer(server)
})

test('responding 500 when an exception is thrown', async t => {
  const server = await startServer(
    10043,
    respondToRequests(next => () => {
      throw new Error('Uncaught')
    })
  )

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10043',
    headers: {},
    body: ''
  })

  t.deepEqual(response, { status: 500, headers: {}, body: '' })

  await stopServer(server)
})
