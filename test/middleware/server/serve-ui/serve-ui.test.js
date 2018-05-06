/* @flow */
import test from 'ava'
import * as path from 'path'
import { withBrowser } from 'passing-notes/test/helpers'
import { flow } from 'lodash'
import { openTab, findElement } from 'puppet-strings'
import { startServer, stopServer, liftResponder } from 'passing-notes/lib/http'
import { serveUi } from 'passing-notes/src/middleware'

const htmlFixturePath = path.join(__dirname, 'fixtures', 'index.html')

withBrowser()

test('serving a JavaScript UI', async t => {
  const { browser } = global

  const server = await startServer(
    10070,
    flow([serveUi(htmlFixturePath), liftResponder])(request => {
      throw new Error('Should not be delegating')
    })
  )

  const tab = await openTab(browser, 'http://localhost:10070')
  await findElement(tab, '#root', 'Hello World!')

  await stopServer(server)
  t.pass()
})
