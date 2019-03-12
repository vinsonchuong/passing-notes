/* @flow */
import test from 'ava'
import { logRequestsAndResponses } from 'passing-notes/lib/log'

test('logging requests and responses', async t => {
  const logs = []
  const log = startEntry => {
    logs.push([startEntry])
    return endEntry => {
      logs.push([startEntry, endEntry])
    }
  }

  const respond = logRequestsAndResponses({ log })(async request => ({
    status: 200,
    headers: {},
    body: ''
  }))

  const promise = respond({
    method: 'GET',
    url: 'http://example.com/path',
    headers: {},
    body: ''
  })

  t.deepEqual(logs, [[{ type: 'HTTP', message: 'GET /path' }]])

  await promise

  t.deepEqual(logs, [
    [{ type: 'HTTP', message: 'GET /path' }],
    [{ type: 'HTTP', message: 'GET /path' }, { message: '200' }]
  ])
})

test('logging errors', async t => {
  const logs = []
  const log = startEntry => {
    logs.push([startEntry])
    return endEntry => {
      logs.push([startEntry, endEntry])
    }
  }

  const error = new Error('Uncaught')
  const respond = logRequestsAndResponses({ log })(async request => {
    throw error
  })

  await t.throwsAsync(
    respond({
      method: 'GET',
      url: '/',
      headers: {},
      body: ''
    })
  )

  t.deepEqual(logs, [
    [{ type: 'HTTP', message: 'GET /' }],
    [{ type: 'HTTP', message: 'GET /' }, { message: '500', error }]
  ])
})
