/* @flow */
import test from 'ava'
import { setContentLength } from 'passing-notes/lib/middleware/server'

test('setting the Content-Length header', async t => {
  const respond = setContentLength(request => ({
    status: 200,
    headers: {},
    body: 'Hello'
  }))

  const response = await respond({ method: 'GET', url: '/', headers: {} })

  t.is(response.headers['content-length'], '5')
})
