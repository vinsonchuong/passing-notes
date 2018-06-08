/* @flow */
import test from 'ava'
import * as path from 'path'
import { withBrowser } from 'passing-notes/test/fixtures'
import { openTab, findElement } from 'puppet-strings'
import { startServer, stopServer, liftResponder } from 'passing-notes/lib/http'
import { combine, serveUi } from 'passing-notes/lib/middleware'

const htmlFixturePath = path.join(__dirname, 'fixtures', 'index.html')

withBrowser({ perTest: false, key: 'browser' })

test('serving a UI and not needlessly rebundling when the middleware is reloaded', async t => {
  const { browser } = global

  const server = await startServer(
    10071,
    combine(liftResponder, serveUi(htmlFixturePath))(request => {
      throw new Error('Should not be delegating')
    })
  )
  const firstLoadDuration = await time(async () => {
    const tab = await openTab(browser, 'http://localhost:10071')
    t.truthy(await findElement(tab, 'div', 'Hello World!'))
  })

  const reloadedServer = await startServer(
    10072,
    combine(liftResponder, serveUi(htmlFixturePath))(request => {
      throw new Error('Should not be delegating')
    })
  )
  const reloadDuration = await time(async () => {
    const tab = await openTab(browser, 'http://localhost:10072')
    t.truthy(await findElement(tab, 'div', 'Hello World!'))
  })

  t.true(reloadDuration < 0.5 * firstLoadDuration)

  await stopServer(server)
  await stopServer(reloadedServer)
})

async function time(doWork) {
  const startTime = process.hrtime()
  await doWork()
  const duration = process.hrtime(startTime)
  return duration[0] * 1000 + duration[1] / 1e6
}
