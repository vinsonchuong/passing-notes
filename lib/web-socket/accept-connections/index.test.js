/* @flow */
import test from 'ava'
import acceptConnections from './'
import { startServer, stopServer } from 'passing-notes/lib/node'
import { fromWebSocket } from 'heliograph'

test('accepting WebSocket connections', async t => {
  const server = await startServer(
    10090,
    null,
    acceptConnections(async serverSocket => {
      for await (const message of serverSocket) {
        await serverSocket.send(`Echo: ${message}`)
      }
    })
  )

  const clientSocket = await fromWebSocket<string, string>(
    'ws://localhost:10090'
  )
  await clientSocket.send('Hello World!')
  t.is((await clientSocket.next()).value, 'Echo: Hello World!')
  await clientSocket.close()

  await stopServer(server)
})

test('closing the connection from the server', async t => {
  const server = await startServer(
    10091,
    null,
    acceptConnections(async serverSocket => {
      await serverSocket.send('Bye!')
      await serverSocket.close()
    })
  )

  const clientSocket = await fromWebSocket<string, string>(
    'ws://localhost:10091'
  )
  t.deepEqual(await clientSocket.next(), { value: 'Bye!', done: false })
  t.deepEqual(await clientSocket.next(), { value: 1000, done: true })

  await stopServer(server)
})
