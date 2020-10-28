import test from 'ava'
import * as httpx from 'httpx-server'
import http2 from 'http2'
import {connect} from '../../index.js'

const {HTTP2_HEADER_METHOD, HTTP2_HEADER_PATH} = http2.constants

test('connecting via HTTP/2', async (t) => {
  const server = httpx.createServer((request, response) => {
    t.is(request.method, 'GET')
    t.is(request.url, '/')
    t.is(request.headers.key, 'value')

    response.createPushResponse(
      {
        [HTTP2_HEADER_METHOD]: 'GET',
        [HTTP2_HEADER_PATH]: '/push'
      },
      (error, response) => {
        response.writeHead(200, {
          'content-type': 'text/plain'
        })
        response.end('Push')
      }
    )

    response.writeHead(200, {
      'content-type': 'text/plain',
      foo: 'bar'
    })
    response.end('Hello World!')
  })

  await new Promise((resolve) => {
    server.listen(10002, resolve)
  })
  t.teardown(() => {
    server.close()
  })

  const session = await connect('http://localhost:10002')
  t.teardown(async () => {
    await session.close()
  })

  const response = await session.sendRequest({
    method: 'GET',
    url: '/',
    headers: {
      key: 'value'
    }
  })

  t.like(response, {
    status: 200,
    headers: {
      foo: 'bar'
    },
    body: 'Hello World!'
  })

  const {
    value: [pushedRequest, pushedResponse]
  } = await session.pushedResponses.next()
  t.like(pushedRequest, {
    method: 'GET',
    url: '/push'
  })
  t.like(pushedResponse, {
    status: 200,
    body: 'Push'
  })
})
