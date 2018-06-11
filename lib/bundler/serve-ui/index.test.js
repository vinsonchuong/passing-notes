/* @flow */
import test from 'ava'
import * as path from 'path'
import { withBrowser } from 'passing-notes/test/fixtures'
import { openTab, findElement } from 'puppet-strings'
import { startServer, stopServer, liftResponder } from 'passing-notes/lib/http'
import { combine, serveUi } from 'passing-notes/lib/middleware'

const htmlFixturePath = path.join(
  __dirname,
  '..',
  'test',
  'fixtures',
  'index.html'
)

withBrowser({ perTest: false, key: 'browser' })

test('serving a UI', async t => {
  const { browser } = global

  const server = await startServer(
    10071,
    combine(liftResponder, serveUi(htmlFixturePath))(request => {
      throw new Error('Should not be delegating')
    })
  )
  const tab = await openTab(browser, 'http://localhost:10071')
  t.truthy(await findElement(tab, 'div', 'Hello World!'))

  await stopServer(server)
})
