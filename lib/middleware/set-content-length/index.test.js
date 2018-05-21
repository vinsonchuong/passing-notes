/* @flow */
import test from 'ava'
import setContentLength from './'

test('setting the Content-Length header', async t => {
  const respond = setContentLength(request => ({
    status: 200,
    headers: {},
    body: 'Hello'
  }))

  const response = await respond({ method: 'GET', url: '/', headers: {} })

  t.is(response.headers['content-length'], '5')
})
