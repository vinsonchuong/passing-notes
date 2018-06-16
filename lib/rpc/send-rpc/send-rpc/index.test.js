/* @flow */
import test from 'ava'
import { sendRpc, serveRpc } from 'passing-notes/lib/rpc'
import {
  startServer,
  stopServer,
  respondToRequests
} from 'passing-notes/lib/http'

test('sending RPC requests', async t => {
  const server = await startServer(
    10060,
    respondToRequests(
      serveRpc({
        getData() {
          return 'Hello World!'
        }
      })
    )
  )

  process.env.PORT = '10060'
  t.deepEqual(await sendRpc({ action: 'getData', params: [] }), {
    result: 'Hello World!'
  })

  await stopServer(server)
})
