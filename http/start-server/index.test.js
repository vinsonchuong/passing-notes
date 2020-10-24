import test from 'ava'
import {startServer, stopServer, sendRequest} from '../../index.js'
import makeCert from 'make-cert'

test('starting an HTTP server', async (t) => {
  const {key, cert} = makeCert('localhost')

  const server = await startServer({port: 10000, cert, key}, () => {
    return {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
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
      headers: {},
      body: null
    }),
    {
      status: 200,
      headers: {
        connection: 'close'
      },
      body: 'Hello World!'
    }
  )

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'https://localhost:10000',
      headers: {},
      body: null
    }),
    {
      status: 200,
      headers: {
        connection: 'close'
      },
      body: 'Hello World!'
    }
  )
})
