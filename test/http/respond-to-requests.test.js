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
        url: 'http://localhost:10040/path',
        headers: {
          accept: '*/*',
          'user-agent':
            'passing-notes/1.0 (+https://github.com/splayd/passing-notes)',
          'x-request': 'Hello'
        }
      })

      return {
        status: 200,
        headers: {
          'x-response': 'World!',
          'content-type': 'application/json'
        },
        body: {
          hello: 'world'
        }
      }
    })
  )

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10040/path',
    headers: {
      'x-request': 'Hello'
    }
  })

  t.deepEqual(response, {
    status: 200,
    headers: {
      'x-response': 'World!'
    },
    body: {
      hello: 'world'
    }
  })

  await stopServer(server)
})
