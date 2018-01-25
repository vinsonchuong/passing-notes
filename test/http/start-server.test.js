/* @flow */
import test from 'ava'
import {
  getPort,
  startServer,
  stopServer,
  fetchText
} from 'passing-notes/src/http'

test('starting an HTTP server', async t => {
  const port = await getPort()
  const server = await startServer(port, (request, response) => {
    response.end('Hello World!')
  })

  t.is(await fetchText(`http://localhost:${port}`), 'Hello World!')

  await stopServer(server)
})
