/* @flow */
import test from 'ava'
import {
  startServer,
  stopServer,
  respondToRequests
} from 'passing-notes/lib/http'
import { defineRpc } from 'passing-notes/lib/rpc'

test.serial('creating a client and server middleware', async t => {
  const { sendRpc, serveRpc } = defineRpc({
    add({ x, y }: { x: number, y: number }): number {
      return x + y
    },

    subtract({ x, y }: { x: number, y: number }): number {
      return x - y
    }
  })

  const server = await startServer(10100, respondToRequests(serveRpc))

  process.env.PORT = '10100'
  t.deepEqual(await sendRpc({ action: 'add', params: { x: 1, y: 2 } }), {
    result: 3
  })

  t.deepEqual(await sendRpc({ action: 'subtract', params: { x: 1, y: 2 } }), {
    result: -1
  })

  await stopServer(server)
})

test.serial('handling exceptions', async t => {
  const { sendRpc, serveRpc } = defineRpc({
    crash(): void {
      throw new Error('Crash')
    }
  })

  const server = await startServer(10101, respondToRequests(serveRpc))

  process.env.PORT = '10101'
  t.deepEqual(await sendRpc({ action: 'crash', params: {} }), {
    error: 'Crash'
  })

  await stopServer(server)
})
