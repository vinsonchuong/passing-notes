/* @flow */
import test from 'ava'
import { fetchText } from 'passing-notes/src/http'

test('making an HTTP request', async t => {
  const responseBody = await fetchText('http://example.com')
  t.true(responseBody.includes('Example Domain'))
})
