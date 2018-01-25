/* @flow */
import test from 'ava'
import { Server } from 'http'
import { getPort } from 'passing-notes/src/http'

test.serial('preferring port 8080', async t => {
  t.is(await getPort(), 8080)
})

test.serial('deferring to the PORT environment variable', async t => {
  process.env.PORT = '10000'
  t.is(await getPort(), 10000)
  Reflect.deleteProperty(process.env, 'PORT')
})

test.serial('ignoring invalid PORT environment variable', async t => {
  process.env.PORT = 'invalid'
  t.is(await getPort(), 8080)
  Reflect.deleteProperty(process.env, 'PORT')
})

test.serial('finding an available port', async t => {
  const server = new Server()
  await new Promise(resolve => {
    server.listen(8080, resolve)
  })

  const port = await getPort()
  t.not(port, 8080)
  t.true(port > 1024)
  t.true(port <= 65535)

  await new Promise(resolve => {
    server.close(resolve)
  })
})
