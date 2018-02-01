/* @flow */
import test from 'ava'
import { sendRequest } from 'passing-notes/src/http'

test('sending a GET request', async t => {
  const response = await sendRequest({
    method: 'GET',
    url: 'http://httpbin.org/ip'
  })

  t.is(response.status, 200)
  t.is(response.headers['content-type'], 'application/json')
  t.true('origin' in response.body)
})
