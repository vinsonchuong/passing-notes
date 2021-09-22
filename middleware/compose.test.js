import test from 'ava'
import {startServer, stopServer, sendRequest, compose} from '../index.js'

test('composing middleware', async (t) => {
  const server = await startServer(
    {port: 10_003},
    compose(
      (next) => async (request) => {
        const response = await next({
          ...request,
          headers: {
            ...request.headers,
            trace: '1',
          },
        })

        t.is(response.headers.trace, '2')

        return {
          ...response,
          headers: {
            ...response.headers,
            trace: `${response.headers.trace}1`,
          },
        }
      },
      () => (request) => {
        t.is(request.headers.trace, '1')

        return {
          status: 200,
          headers: {
            trace: '2',
            'content-type': 'text/plain',
          },
          body: 'Hello World!',
        }
      },
      () => () => ({status: 404, headers: {}, body: ''}),
    ),
  )
  t.teardown(async () => {
    await stopServer(server)
  })

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10003',
      headers: {},
    }),
    {
      status: 200,
      headers: {
        trace: '21',
      },
      body: 'Hello World!',
    },
  )
})
