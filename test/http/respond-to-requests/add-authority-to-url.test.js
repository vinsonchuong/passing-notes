/* @flow */
import test from 'ava'
import { addAuthorityToUrl } from 'passing-notes/src/http/respond-to-requests'

test('combining the Host header with the URL', t => {
  t.plan(2)

  const respond = addAuthorityToUrl(request => {
    t.deepEqual(request, {
      method: 'GET',
      url: 'http://www.example.com/path',
      headers: {}
    })

    return {
      status: 200,
      headers: {},
      body: 'Hello'
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
    body: 'Hello'
  })
})
