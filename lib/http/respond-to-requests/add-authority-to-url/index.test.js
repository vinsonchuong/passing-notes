/* @flow */
import test from 'ava'
import { addAuthorityToUrl } from 'passing-notes/lib/http/respond-to-requests'

test('combining the Host header with the URL', t => {
  const respond = addAuthorityToUrl(request => {
    t.deepEqual(request, {
      method: 'GET',
      url: 'http://www.example.com/path',
      headers: {}
    })

    return {
      status: 200,
      headers: {},
      body: ''
    }
  })

  const response = respond({
    method: 'GET',
    url: '/path',
    headers: {
      host: 'www.example.com'
    }
  })

  t.deepEqual(response, {
    status: 200,
    headers: {},
    body: ''
  })
})
