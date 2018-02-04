/* @flow */
import test from 'ava'
import {
  startServer,
  stopServer,
  respondToRequests,
  sendRequest
} from 'passing-notes/src/http'

test('responding to requests', async t => {
  t.plan(2)

  const server = await startServer(
    10040,
    respondToRequests(request => {
      t.deepEqual(request, {
        method: 'GET',
        url: '/path',
        headers: {
          host: 'localhost:10040',
          'x-request': 'Hello'
        }
      })

      return {
        status: 200,
        headers: {
          'X-Response': 'World!'
        },
        body: {
          hello: 'world'
        }
      }
    })
  )

  const requestTime = new Date().toUTCString()
  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10040/path',
    headers: {
      'X-Request': 'Hello'
    }
  })

  t.deepEqual(response, {
    status: 200,
    headers: {
      connection: 'close',
      date: requestTime,
      'x-response': 'World!'
    },
    body: {
      hello: 'world'
    }
  })

  await stopServer(server)
})
