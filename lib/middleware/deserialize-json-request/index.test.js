/* @flow */
import test from 'ava'
import { deserializeJsonRequest } from 'passing-notes/lib/middleware'

test('deserializing a JSON request', async t => {
  t.plan(1)

  const respond = deserializeJsonRequest(request => {
    t.deepEqual(request.body, { message: 'Hello World!' })
    return { status: 200, headers: {}, body: null }
  })

  await respond({
    method: 'POST',
    url: '/',
    headers: {
      'content-type': 'application/json'
    },
    body: '{"message": "Hello World!"}'
  })
})

test('not attempting to deserialize if content-type is not JSON', async t => {
  t.plan(1)

  const respond = deserializeJsonRequest(request => {
    t.deepEqual(request.body, 'Not JSON')
    return { status: 200, headers: {}, body: null }
  })

  await respond({
    method: 'POST',
    url: '/',
    headers: {},
    body: 'Not JSON'
  })
})
