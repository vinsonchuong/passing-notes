/* @flow */
import test from 'ava'
import serializeJsonResponse from './'

test('serializing a JSON body', async t => {
  const respond = serializeJsonResponse(request => ({
    status: 200,
    headers: {},
    body: { hello: 'world' }
  }))

  const response = await respond({ method: 'GET', url: '/', headers: {} })

  t.deepEqual(response, {
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: '{"hello":"world"}'
  })
})

test('not attempting to serialize a string', async t => {
  const respond = serializeJsonResponse(request => ({
    status: 200,
    headers: {},
    body: 'Hello World!'
  }))

  const response = await respond({ method: 'GET', url: '/', headers: {} })

  t.not(response.headers['content-type'], 'application/json')
  t.is(response.body, 'Hello World!')
})

test('not attempting to serialize a Buffer', async t => {
  const respond = serializeJsonResponse(request => ({
    status: 200,
    headers: {},
    body: Buffer.from('Hello World!')
  }))

  const response = await respond({ method: 'GET', url: '/', headers: {} })

  t.not(response.headers['content-type'], 'application/json')
  t.true(response.body instanceof Buffer)
  t.is(response.body.toString(), 'Hello World!')
})
