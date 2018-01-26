/* @flow */
import test from 'ava'
import { openTab, closeTab, findElement } from 'puppet-strings'
import {
  withDirectory,
  writeFile,
  withBrowser
} from 'passing-notes/test/helpers'
import { startServer, stopServer } from 'passing-notes/src/http'
import passNotes, { serveUi } from 'passing-notes'

withDirectory()
withBrowser()

test('compiling and serving a UI', async t => {
  const { browser } = global
  const { directory } = t.context

  const entryPoint = await writeFile(
    directory,
    'index.html',
    `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <script async src="index.js"></script>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `
  )

  await writeFile(
    directory,
    'index.js',
    `
    window.root.textContent = 'Hello World!'
  `
  )

  const server = await startServer(10020, passNotes(serveUi(entryPoint)))
  const tab = await openTab(browser, 'http://localhost:10020')

  await t.notThrows(findElement(tab, '#root', 'Hello World!'))

  await closeTab(tab)
  await stopServer(server)
})
