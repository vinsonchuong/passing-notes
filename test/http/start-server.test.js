/* @flow */
import test from 'ava'
import { startServer, stopServer, fetchText } from 'passing-notes/src/http'

test('starting an HTTP server', async t => {
  const server = await startServer(10010, (request, response) => {
    response.end('Hello World!')
  })

  t.is(await fetchText('http://localhost:10010'), 'Hello World!')

  await stopServer(server)
})
