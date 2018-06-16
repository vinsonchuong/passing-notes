/* @flow */
import test from 'ava'
import { filterRequestHeaders } from 'passing-notes/lib/http/respond-to-requests'

test('filtering request headers', async t => {
  t.plan(1)

  const respond = filterRequestHeaders(request => {
    t.deepEqual(request, {
      method: 'POST',
      url: '/',
      headers: {
        'x-other': 'unfiltered'
      },
      body: 'foo'
    })

    return { status: 200, headers: {}, body: null }
  })

  await respond({
    method: 'POST',
    url: '/',
    headers: {
      'x-other': 'unfiltered',
      'content-length': '3'
    },
    body: 'foo'
  })
})
