/* @flow */
import test from 'ava'
import td from 'testdouble'
import {
  startServer,
  stopServer,
  respondToRequests
} from 'passing-notes/lib/http'
import { defineRpc } from 'passing-notes/lib/rpc'

test.serial('creating a client and server middleware', async t => {
  const { api, sendRpc, serveRpc } = defineRpc({
    add({ x, y }: { x: number, y: number }): number {
      return x + y
    },

    subtract({ x, y }: { x: number, y: number }): number {
      return x - y
    },

    constant(): number {
      return 42
    }
  })

  const server = await startServer(
    10100,
    respondToRequests(serveRpc({ log: () => {} }))
  )

  process.env.PORT = '10100'

  t.deepEqual(await sendRpc({ action: 'add', params: { x: 1, y: 2 } }), {
    result: 3
  })
  t.is(await api.add({ x: 1, y: 2 }), 3)

  t.deepEqual(await sendRpc({ action: 'subtract', params: { x: 1, y: 2 } }), {
    result: -1
  })
  t.is(await api.subtract({ x: 1, y: 2 }), -1)

  t.deepEqual(await sendRpc({ action: 'constant', params: {} }), {
    result: 42
  })
  t.is(await api.constant(), 42)

  await stopServer(server)
})

test.serial('handling exceptions', async t => {
  const { api, sendRpc, serveRpc } = defineRpc({
    crash(_: {}): void {
      throw new Error('Crash')
    }
  })

  const server = await startServer(
    10101,
    respondToRequests(serveRpc({ log: () => {} }))
  )

  process.env.PORT = '10101'
  t.deepEqual(await sendRpc({ action: 'crash', params: {} }), {
    error: 'Crash'
  })

  // $FlowFixMe
  await t.throws(api.crash({}))

  await stopServer(server)
})

test.serial('logging requests and responses', async t => {
  const { sendRpc, serveRpc } = defineRpc({
    getStuff({ id }: { id: number }): Array<string> {
      return ['a', 'b']
    },

    error(): void {
      throw new Error('Error')
    }
  })

  const log = td.func()
  const server = await startServer(10102, respondToRequests(serveRpc({ log })))

  process.env.PORT = '10102'
  await sendRpc({ action: 'getStuff', params: { id: 1 } })

  td.verify(log(td.matchers.contains({ type: 'RPC', message: 'getStuff' })))
  td.verify(
    log(
      td.matchers.contains({ type: 'RPC', message: 'getStuff' }),
      td.matchers.contains({ type: 'RPC', message: 'Returned' })
    )
  )

  await sendRpc({ action: 'error', params: {} })

  td.verify(log(td.matchers.contains({ type: 'RPC', message: 'error' })))
  td.verify(
    log(
      td.matchers.contains({ type: 'RPC', message: 'error' }),
      td.matchers.contains({ type: 'RPC', message: 'Threw an Error' })
    )
  )

  await stopServer(server)
  t.pass()
})
