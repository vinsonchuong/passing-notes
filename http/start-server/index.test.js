import test from 'ava'
import {startServer, stopServer, sendRequest} from '../../index.js'
import makeCert from 'make-cert'

test('starting an HTTP server', async (t) => {
  const {key, cert} = makeCert('localhost')

  const server = await startServer({port: 10000, cert, key}, (request) => {
    t.like(request, {
      version: '1.1',
      method: 'GET',
      url: '/',
      headers: {
        'accept': 'text/plain'
      },
      body: ''
    })

    return {
      status: 200,
      headers: {
        'content-type': 'text/plain'
      },
      body: 'Hello World!'
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
        'accept': 'text/plain'
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
})
