/* @flow */
import test from 'ava'
import { serializeJsonRequest } from 'passing-notes/lib/middleware'

test('serializing a JSON request', async t => {
  t.plan(1)

  const makeRequest = serializeJsonRequest(request => {
    t.deepEqual(request, {
      method: 'POST',
      url: '/',
      headers: {
        'content-type': 'application/json'
      },
      body: '{"message":"Ping"}'
    })
    return { status: 200, headers: {}, body: null }
  })

  await makeRequest({
    method: 'POST',
    url: '/',
    headers: {},
    body: { message: 'Ping' }
  })
})

test('not attempting to serialize a string body', async t => {
  t.plan(1)

  const makeRequest = serializeJsonRequest(request => {
    t.deepEqual(request, {
      method: 'POST',
      url: '/',
      headers: {},
      body: 'Hello World!'
    })
    return { status: 200, headers: {}, body: null }
  })

  await makeRequest({
    method: 'POST',
    url: '/',
    headers: {},
    body: 'Hello World!'
  })
})

test('not attempting to serialize an empty body', async t => {
  t.plan(1)

  const makeRequest = serializeJsonRequest(request => {
    t.deepEqual(request, {
      method: 'GET',
      url: '/',
      headers: {},
      body: null
    })
    return { status: 200, headers: {}, body: null }
  })

  await makeRequest({
    method: 'GET',
    url: '/',
    headers: {},
    body: null
  })
})
