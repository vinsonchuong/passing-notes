/* @flow */
import test from 'ava'
import { filterResponseHeaders } from 'passing-notes/lib/http/send-request'

test('removing headers specific to HTTP transport', async t => {
  const makeRequest = filterResponseHeaders(() => ({
    status: 200,
    headers: {
      server: 'passing-notes',
      connection: 'close',
      'x-my-header': 'hello'
    },
    body: ''
  }))

  const response = await makeRequest({
    method: 'GET',
    url: '/',
    headers: {},
    body: ''
  })

  t.false('server' in response.headers)
  t.false('connection' in response.headers)

  t.true('x-my-header' in response.headers)
})
