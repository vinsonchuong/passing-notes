/* @flow */
import test from 'ava'
import { liftRequest } from 'passing-notes/lib/http'

test('adapting a functional requester to the Fetch API', async t => {
  const response = await liftRequest({
    method: 'GET',
    headers: {},
    url: 'http://example.com'
  })
  t.is(response.status, 200)

  t.truthy(response.body.match(/Example Domain/))
})

test('fetching JSON', async t => {
  const response = await liftRequest({
    method: 'GET',
    headers: {},
    url: 'http://httpbin.org/ip'
  })

  t.true('origin' in response.body)
  t.false('content-type' in response.headers)
})

test('sending a POST request', async t => {
  const response = await liftRequest({
    method: 'POST',
    url: 'http://httpbin.org/post',
    headers: {},
    body: JSON.stringify({
      hello: 'world'
    })
  })

  t.is(response.status, 200)
  t.is(response.body.data, '{"hello":"world"}')
})
