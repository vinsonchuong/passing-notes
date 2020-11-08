import test from 'ava'
import {startServer, stopServer, sendRequest, connect} from '../../index.js'
import makeCert from 'make-cert'
import intoStream from 'into-stream'

test('starting an HTTP server', async (t) => {
  const {key, cert} = makeCert('localhost')

  const server = await startServer({port: 10000, cert, key}, (request) => {
    if (request.url === '/') {
      t.like(request, {
        method: 'GET',
        url: '/',
        headers: {
          accept: 'text/plain'
        },
        body: ''
      })
    } else {
      t.like(request, {
        version: '2.0',
        method: 'GET',
        url: '/push'
      })
    }

    if (request.version === '1.1') {
      return {
        status: 200,
        headers: {
          'content-type': 'text/plain'
        },
        body: 'Hello World!'
      }
    }

    if (request.version === '2.0') {
      if (request.url === '/') {
        return {
          status: 200,
          headers: {
            'content-type': 'text/plain'
          },
          body: 'Hello World!',
          push: [{method: 'GET', url: '/push', headers: {}}]
        }
      }

      if (request.url === '/push') {
        return {
          status: 200,
          headers: {
            'content-type': 'text/plain'
          },
          body: 'Push!'
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
        accept: 'text/plain'
      },
      body: ''
    }),
    {
      status: 200,
      headers: {
        'content-type': 'text/plain'
      },
      body: 'Hello World!'
    }
  )

  const session = await connect('https://localhost:10000')

  t.like(
    await session.sendRequest({
      method: 'GET',
      url: '/',
      headers: {
        accept: 'text/plain'
      }
    }),
    {
      status: 200,
      headers: {
        'content-type': 'text/plain'
      },
      body: 'Hello World!'
    }
  )

  const {
    value: [request, response]
  } = await session.pushedResponses.next()
  t.like(request, {
    method: 'GET',
    url: '/push'
  })
  t.like(response, {
    status: 200,
    body: 'Push!'
  })

  await session.close()
})

test('supporting a stream body', async (t) => {
  const server = await startServer({port: 10004}, () => {
    return {
      status: 200,
      headers: {
        'content-type': 'text/plain'
      },
      body: intoStream('Hello World!')
    }
  })
  t.teardown(async () => {
    stopServer(server)
  })

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10004',
      headers: {}
    }),
    {
      body: 'Hello World!'
    }
  )
})

test('supporting a buffer body', async (t) => {
  const server = await startServer({port: 10005}, () => {
    return {
      status: 200,
      headers: {
        'content-type': 'text/plain'
      },
      body: Buffer.from('Hello World!')
    }
  })
  t.teardown(async () => {
    stopServer(server)
  })

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10005',
      headers: {}
    }),
    {
      body: 'Hello World!'
    }
  )
})

test('omitting unused fields', async (t) => {
  const server = await startServer({port: 10006}, () => {
    return {status: 200}
  })
  t.teardown(async () => {
    stopServer(server)
  })

  t.like(await sendRequest({method: 'GET', url: 'http://localhost:10006'}), {
    status: 200
  })
})
