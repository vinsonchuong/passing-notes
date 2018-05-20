/* @flow */
import test from 'ava'
import { evaluateInBrowser } from 'passing-notes/test/helpers'
import { resolveAbsoluteUrl } from 'passing-notes/lib/middleware/client'

process.env.PORT = '10050'

test.serial(
  'converting a relative URL to an absolute URL in Node.js',
  async t => {
    t.plan(1)

    const makeRequest = resolveAbsoluteUrl(request => {
      t.is(request.url, 'http://localhost:10050/path')
      return { status: 200, headers: {}, body: '' }
    })

    await makeRequest({ method: 'GET', url: '/path', headers: {} })
  }
)

test.serial('not changing absolute URLs in Node.js', async t => {
  t.plan(1)

  const makeRequest = resolveAbsoluteUrl(request => {
    t.is(request.url, 'http://example.com/path')
    return { status: 200, headers: {}, body: '' }
  })

  await makeRequest({
    method: 'GET',
    url: 'http://example.com/path',
    headers: {}
  })
})

test.serial(
  'converting a relative URL to an absolute URL in the browser',
  async t => {
    const request = await evaluateInBrowser(`
    import { resolveAbsoluteUrl } from 'passing-notes/lib/middleware/client'

    export default async function() {
      let request
      const makeRequest = resolveAbsoluteUrl(r => {
        request = r
        return { status: 200, headers: {}, body: '' }
      })
      await makeRequest({ method: 'GET', url: '/path', headers: {} })
      return request
    }
  `)

    t.is(request.url, 'http://localhost:10050/path')
  }
)

test.serial('not changing absolute URLs in the browser', async t => {
  const request = await evaluateInBrowser(`
    import { resolveAbsoluteUrl } from 'passing-notes/lib/middleware/client'

    export default async function() {
      let request
      const makeRequest = resolveAbsoluteUrl(r => {
        request = r
        return { status: 200, headers: {}, body: '' }
      })
      await makeRequest({
        method: 'GET',
        url: 'http://example.com/path',
        headers: {}
      })
      return request
    }
  `)

  t.is(request.url, 'http://example.com/path')
})
