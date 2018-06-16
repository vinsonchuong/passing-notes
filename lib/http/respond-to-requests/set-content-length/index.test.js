/* @flow */
import test from 'ava'
import { setContentLength } from 'passing-notes/lib/http/respond-to-requests'
import intoStream from 'into-stream'

test('setting the Content-Length header for a string response', async t => {
  const respond = setContentLength(async request => ({
    status: 200,
    headers: {},
    body: 'Hello'
  }))

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {},
    body: ''
  })

  t.is(response.headers['content-length'], '5')
})

test('setting the Content-Length header for a Buffer response', async t => {
  const respond = setContentLength(async request => ({
    status: 200,
    headers: {},
    body: Buffer.from('Hello')
  }))

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {},
    body: ''
  })

  t.is(response.headers['content-length'], '5')
})

test('not setting the Content-Length header for a Stream response', async t => {
  const respond = setContentLength(async request => ({
    status: 200,
    headers: {},
    body: intoStream('Hello')
  }))

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {},
    body: ''
  })

  t.false('content-length' in response.headers)
})
