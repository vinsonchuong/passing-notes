/* @flow */
import test from 'ava'
import { startServer, stopServer } from '../'
import fetch from 'node-fetch'

test('stopping an HTTP server', async t => {
  const server = await startServer(10011, () => {})
  await stopServer(server)

  await t.throwsAsync(fetch('http://localhost:10011'), /ECONNREFUSED/)
})
