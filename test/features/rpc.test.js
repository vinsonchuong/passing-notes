/* @flow */
import test from 'ava'
import { openTab, closeTab, findElement } from 'puppet-strings'
import { withProject, writeFile, withBrowser } from 'passing-notes/test/helpers'
import { startServer, stopServer } from 'passing-notes/src/http'
import passNotes, { ui, rpc } from 'passing-notes'

withProject()
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
    import { api } from 'passing-notes'

    async function run() {
      const sum = await api.add(1, 2)
      window.root.textContent = String(sum)
    }
    run()
  `
  )

  const server = await startServer(
    10030,
    passNotes(
      rpc({
        add(x, y) {
          return x + y
        }
      }),
      ui(entryPoint)
    )
  )
  const tab = await openTab(browser, 'http://localhost:10030')

  await t.notThrows(findElement(tab, '#root', '3'))

  await closeTab(tab)
  await stopServer(server)
})
