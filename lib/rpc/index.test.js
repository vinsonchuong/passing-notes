/* @flow */
import test from 'ava'
import td from 'testdouble'
import {
  startServer,
  stopServer,
  respondToRequests
} from 'passing-notes/lib/http'
import { serveRpc, makeRpcClient } from 'passing-notes/lib/rpc'

test('creating a client and server middleware', async t => {
  const actions = {
    add: () => ({ x, y }: { x: number, y: number }): number => x + y,
    subtract: () => (a: number, b: number): number => a - b,
    constant: ({ magic }: { magic: number }) => (): number => magic
  }

  const server = await startServer(
    10100,
    respondToRequests(
      serveRpc({
        actions,
        path: '/rpc',
        log: () => {},
        magic: 42
      })
    )
  )

  const client = makeRpcClient<typeof actions>('http://localhost:10100/rpc')

  t.is(await client.add({ x: 1, y: 2 }), 3)
  t.is(await client.subtract(1, 2), -1)
  t.is(await client.constant(), 42)

  await stopServer(server)
})

test('handling exceptions', async t => {
  const actions = {
    crash: () => (): void => {
      throw new Error('Crash')
    }
  }

  const server = await startServer(
    10101,
    respondToRequests(serveRpc({ actions, path: '/rpc', log: () => {} }))
  )

  const client = makeRpcClient<typeof actions>('http://localhost:10101/rpc')

  await t.throwsAsync(client.crash())

  await stopServer(server)
})

test('logging requests and responses', async t => {
  const actions = {
    getStuff: () => ({ id }: { id: number }): Array<string> => {
      return ['a', 'b']
    },

    error: () => (): void => {
      throw new Error('Error')
    }
  }

  const log = td.func()
  const server = await startServer(
    10102,
    respondToRequests(serveRpc({ actions, path: '/rpc', log }))
  )
  const client = makeRpcClient<typeof actions>('http://localhost:10102/rpc')

  await client.getStuff({ id: 1 })

  td.verify(log(td.matchers.contains({ type: 'RPC', message: 'getStuff' })))
  td.verify(
    log(
      td.matchers.contains({ type: 'RPC', message: 'getStuff' }),
      td.matchers.contains({ type: 'RPC', message: 'Returned' })
    )
  )

  await t.throwsAsync(client.error())

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
