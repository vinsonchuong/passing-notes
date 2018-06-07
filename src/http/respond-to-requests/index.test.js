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
          'user-agent':
            'passing-notes/1.0 (+https://github.com/splayd/passing-notes)',
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
      'x-request': 'Hello'
    },
    body: {
      message: 'Ping'
    }
  })

  t.deepEqual(response, {
    status: 200,
    headers: {
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
    headers: {}
  })

  t.deepEqual(response, { status: 404, headers: {}, body: null })

  await stopServer(server)
})

test('responding 404 when no middleware respond', async t => {
  const server = await startServer(10042, respondToRequests(next => next))

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10042/path',
    headers: {}
  })

  t.deepEqual(response, { status: 404, headers: {}, body: null })

  await stopServer(server)
})
