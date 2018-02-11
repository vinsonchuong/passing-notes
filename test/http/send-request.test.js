/* @flow */
import test from 'ava'
import { sendRequest } from 'passing-notes/src/http'

test('sending a GET request', async t => {
  const response = await sendRequest({
    method: 'GET',
    url: 'http://httpbin.org/ip',
    headers: {}
  })

  t.is(response.status, 200)
  t.true('origin' in response.body)
})

test('sending a POST request', async t => {
  const response = await sendRequest({
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
