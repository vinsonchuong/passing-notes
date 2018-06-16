/* @flow */
import test from 'ava'
import { addAuthorityToUrl } from 'passing-notes/lib/http/respond-to-requests'

test('combining the Host header with the URL', async t => {
  const respond = addAuthorityToUrl(async request => {
    t.deepEqual(request, {
      method: 'GET',
      url: 'http://www.example.com/path',
      headers: {},
      body: ''
    })

    return {
      status: 200,
      headers: {},
      body: ''
    }
  })

  const response = await respond({
    method: 'GET',
    url: '/path',
    headers: {
      host: 'www.example.com'
    },
    body: ''
  })

  t.deepEqual(response, {
    status: 200,
    headers: {},
    body: ''
  })
})
