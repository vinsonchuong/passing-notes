import {Buffer} from 'node:buffer'
import {createHash} from 'node:crypto'
import {Readable} from 'node:stream'
import http from 'node:http'
import {setTimeout} from 'node:timers/promises'
import test from 'ava'
import WebSocket from 'ws'
import makeCert from 'make-cert'
import intoStream from 'into-stream'
import {startServer, stopServer, sendRequest, connect} from '../../index.js'

test('starting an HTTP server', async (t) => {
  const {key, cert} = makeCert('localhost')

  const server = await startServer({port: 10_000, cert, key}, (request) => {
    if (request.url === '/') {
      t.like(request, {
        method: 'GET',
        url: '/',
        headers: {
          accept: 'text/plain',
        },
        body: '',
      })
    } else {
      t.like(request, {
        version: '2.0',
        method: 'GET',
        url: '/push',
      })
    }

    if (request.version === '1.1') {
      return {
        status: 200,
        headers: {
          'content-type': 'text/plain',
        },
        body: 'Hello World!',
      }
    }

    if (request.version === '2.0') {
      if (request.url === '/') {
        return {
          status: 200,
          headers: {
            'content-type': 'text/plain',
          },
          body: 'Hello World!',
          push: [{method: 'GET', url: '/push', headers: {}}],
        }
      }

      if (request.url === '/push') {
        return {
          status: 200,
          headers: {
            'content-type': 'text/plain',
          },
          body: 'Push!',
        }
      }
    }
  })
  t.teardown(async () => {
    await stopServer(server)
  })

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10000',
      headers: {
        accept: 'text/plain',
      },
      body: '',
    }),
    {
      status: 200,
      headers: {
        'content-type': 'text/plain',
      },
      body: 'Hello World!',
    },
  )

  const session = await connect('https://localhost:10000')

  t.like(
    await session.sendRequest({
      method: 'GET',
      url: '/',
      headers: {
        accept: 'text/plain',
      },
    }),
    {
      status: 200,
      headers: {
        'content-type': 'text/plain',
      },
      body: 'Hello World!',
    },
  )

  const {
    value: [request, response],
  } = await session.pushedResponses.next()
  t.like(request, {
    method: 'GET',
    url: '/push',
  })
  t.like(response, {
    status: 200,
    body: 'Push!',
  })

  await session.close()
})

test('supporting a web stream body', async (t) => {
  const server = await startServer({port: 10_004}, () => ({
    status: 200,
    headers: {
      'content-type': 'text/plain',
    },
    body: Readable.toWeb(intoStream('Hello World!')),
  }))
  t.teardown(async () => {
    stopServer(server)
  })

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10004',
      headers: {},
    }),
    {
      body: 'Hello World!',
    },
  )
})

test('closing a web stream when the requester closes the connection', async (t) => {
  await new Promise(async (resolve) => {
    const server = await startServer({port: 10_005}, () => ({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
      },
      body: new ReadableStream({
        async pull(controller) {
          await setTimeout(100)
          controller.enqueue('Echo')
        },
        cancel() {
          resolve()
        },
      }),
    }))
    t.teardown(async () => {
      stopServer(server)
    })

    const request = http.request('http://localhost:10005', async (response) => {
      await setTimeout(200)
      response.destroy()
    })
    request.end()
  })

  t.pass()
})

test('supporting a stream body', async (t) => {
  const server = await startServer({port: 10_006}, () => ({
    status: 200,
    headers: {
      'content-type': 'text/plain',
    },
    body: intoStream('Hello World!'),
  }))
  t.teardown(async () => {
    stopServer(server)
  })

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10006',
      headers: {},
    }),
    {
      body: 'Hello World!',
    },
  )
})

test('supporting a buffer body', async (t) => {
  const server = await startServer({port: 10_007}, () => ({
    status: 200,
    headers: {
      'content-type': 'text/plain',
    },
    body: Buffer.from('Hello World!'),
  }))
  t.teardown(async () => {
    stopServer(server)
  })

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10007',
      headers: {},
    }),
    {
      body: 'Hello World!',
    },
  )
})

test('omitting unused fields', async (t) => {
  const server = await startServer({port: 10_008}, () => ({status: 200}))
  t.teardown(async () => {
    stopServer(server)
  })

  t.like(await sendRequest({method: 'GET', url: 'http://localhost:10008'}), {
    status: 200,
  })
})

test('allowing upgrading to WebSocket', async (t) => {
  const webSocketHashingConstant = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
  const keyRegex = /^[+/\dA-Za-z]{22}==$/

  const server = await startServer({port: 10_009}, (request) => {
    if (
      request.headers.connection === 'Upgrade' &&
      request.headers.upgrade === 'websocket'
    ) {
      t.log(request)

      const key = request.headers['sec-websocket-key']
      if (!key || !keyRegex.test(key)) {
        return {
          status: 400,
          body: 'Invalid Key',
        }
      }

      return {
        status: 101,
        headers: {
          Upgrade: 'websocket',
          Connection: 'Upgrade',
          'Sec-WebSocket-Accept': createHash('sha1')
            .update(`${key}${webSocketHashingConstant}`)
            .digest('base64'),
        },
        async upgrade(socket, head) {
          const ws = new WebSocket(null, undefined, {})
          ws.setSocket(socket, head, {
            maxPayload: 100 * 1024 * 1024,
            skipUTF8Validation: false,
          })

          const message = await new Promise((resolve) => {
            ws.once('message', resolve)
          })
          t.is(message.toString(), 'Ping')

          ws.send('Pong')
        },
      }
    }

    return {
      status: 426,
    }
  })
  t.teardown(async () => {
    stopServer(server)
  })

  t.like(await sendRequest({method: 'GET', url: 'http://localhost:10009'}), {
    status: 426,
  })

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10009',
      headers: {
        Connection: 'Upgrade',
        Upgrade: 'unsupported',
      },
    }),
    {
      status: 426,
    },
  )

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10009',
      headers: {
        Connection: 'Upgrade',
        Upgrade: 'websocket',
      },
    }),
    {
      status: 400,
    },
  )

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10009',
      headers: {
        Connection: 'Upgrade',
        Upgrade: 'websocket',
        'Sec-WebSocket-Key': 'invalid',
      },
    }),
    {
      status: 400,
    },
  )

  const ws = new WebSocket('ws://localhost:10009')
  await new Promise((resolve) => {
    ws.once('open', resolve)
  })
  ws.send('Ping')

  const message = await new Promise((resolve) => {
    ws.once('message', resolve)
  })
  t.is(message.toString(), 'Pong')

  ws.close()
})
