/* @flow */
import test from 'ava'
import { sendRequest } from 'passing-notes'

test('sending a GET request', async t => {
  const response = await sendRequest({
    method: 'GET',
    url: 'http://httpbin.org/ip',
    headers: {},
    body: null
  })

  t.is(response.status, 200)
  t.true('origin' in response.body)
})

test('sending a JSON request', async t => {
  const response = await sendRequest({
    method: 'POST',
    url: 'http://httpbin.org/post',
    headers: {},
    body: { message: 'Hello World!' }
  })

  t.is(response.status, 200)
  t.deepEqual(response.body.json, { message: 'Hello World!' })
})
