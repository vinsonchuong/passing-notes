/* @flow */
import test from 'ava'
import { startServer, stopServer } from 'passing-notes/lib/http'
import { sendRpc, serveRpc, respondToRequests } from 'passing-notes'

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
