/* @flow */
import test from 'ava'
import { startServer, stopServer } from 'passing-notes/lib/http'
import { sendRequest } from 'passing-notes'

test('stopping an HTTP server', async t => {
  const server = await startServer(10011, () => {})
  await stopServer(server)

  // $FlowFixMe
  await t.throws(
    sendRequest({
      method: 'GET',
      url: 'http://localhost:10011',
      headers: {},
      body: null
    }),
    /ECONNREFUSED/
  )
})
