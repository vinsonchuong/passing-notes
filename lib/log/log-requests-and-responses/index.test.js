/* @flow */
import test from 'ava'
import td from 'testdouble'
import { logRequestsAndResponses } from 'passing-notes/lib/log'

test('logging requests and responses', async t => {
  const log = td.func()
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

  td.verify(log(td.matchers.contains({ type: 'HTTP', message: 'GET /path' })))

  await promise

  td.verify(
    log(
      td.matchers.contains({ type: 'HTTP', message: 'GET /path' }),
      td.matchers.contains({ type: 'HTTP', message: '200' })
    )
  )
  t.pass()
})

test('logging errors', async t => {
  const log = td.func()
  const error = new Error('Uncaught')
  const respond = logRequestsAndResponses({ log })(async request => {
    throw error
  })

  await t.throws(
    respond({
      method: 'GET',
      url: '/',
      headers: {},
      body: ''
    })
  )

  td.verify(
    log(
      td.matchers.contains({ type: 'HTTP', message: 'GET /' }),
      td.matchers.contains({ type: 'HTTP', message: '500', error })
    )
  )
  t.pass()
})
