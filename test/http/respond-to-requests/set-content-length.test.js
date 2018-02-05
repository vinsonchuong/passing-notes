/* @flow */
import test from 'ava'
import { setContentLength } from 'passing-notes/src/http/respond-to-requests'

test('setting the Content-Length header', async t => {
  const respond = setContentLength(request => ({
    status: 200,
    headers: {},
    body: 'Hello'
  }))

  const response = await respond({ method: 'GET', url: '/', headers: {} })

  t.is(response.headers['content-length'], '5')
})
