/* @flow */
import test from 'ava'
import { startServer, stopServer } from 'passing-notes/lib/node'
import { sendRequest, respondToRequests } from 'passing-notes/lib/http'

test('responding to requests', async t => {
  const server = await startServer(
    10040,
    respondToRequests(next => async request => {
      t.deepEqual(request, {
        method: 'GET',
        url: 'http://localhost:10040/path',
        headers: {},
        body: ''
      })

      return {
        status: 200,
        headers: {},
        body: ''
      }
    })
  )

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10040/path',
    headers: {},
    body: ''
  })

  t.deepEqual(response, {
    status: 200,
    headers: {},
    body: ''
  })

  await stopServer(server)
})

test('responding 404 when no middleware are specified', async t => {
  const server = await startServer(10041, respondToRequests())

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10041',
    headers: {},
    body: ''
  })

  t.deepEqual(response, { status: 404, headers: {}, body: '' })

  await stopServer(server)
})

test('responding 500 when an exception is thrown', async t => {
  const server = await startServer(
    10043,
    respondToRequests(next => () => {
      throw new Error('Uncaught')
    })
  )

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10043',
    headers: {},
    body: ''
  })

  t.deepEqual(response, { status: 500, headers: {}, body: '' })

  await stopServer(server)
})
