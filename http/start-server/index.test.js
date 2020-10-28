import test from 'ava'
import {startServer, stopServer, sendRequest, connect} from '../../index.js'
import makeCert from 'make-cert'

test('starting an HTTP server', async (t) => {
  const {key, cert} = makeCert('localhost')

  const server = await startServer({port: 10000, cert, key}, (request) => {
    t.like(request, {
      method: 'GET',
      url: '/',
      headers: {
        accept: 'text/plain'
      },
      body: ''
    })

    if (request.version === '1.1') {
      return {
        status: 200,
        headers: {
          'content-type': 'text/plain'
        },
        body: 'Hello World!'
      }
    } else if (request.version === '2.0') {
      if (request.url === '/') {
        return {
          status: 200,
          headers: {
            'content-type': 'text/plain'
          },
          body: 'Hello World!',
          push: [
            {method: 'GET', url: '/push', headers: {}}
          ]
        }
      } else if (request.url === '/push') {
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
  t.teardown(async () => {
    await session.close()
  })

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

  for await (const [request, response] of session.pushedResponses) {
    t.like(request, {
      method: 'GET',
      url: '/push'
    })
    t.like(response, {
      status: 200,
      body: 'Push!'
    })
    break
  }
})
