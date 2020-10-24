import test from 'ava'
import {startServer, stopServer, connect} from '../../index.js'
import makeCert from 'make-cert'

test('connecting via HTTP/2', async (t) => {
  const {key, cert} = makeCert('localhost')
  const server = await startServer({port: 10002, key, cert}, (request) => {
    t.like(request, {
      method: 'GET',
      url: '/path',
      headers: {
        key: 'value'
      },
      body: ''
    })

    return {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        foo: 'bar'
      },
      body: 'Hello World!'
    }
  })
  t.teardown(async () => {
    await stopServer(server)
  })

  const session = await connect('https://localhost:10002')
  const response = await session.sendRequest({
    method: 'GET',
    url: '/path',
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

  await session.close()
})
