import test from 'ava'
import {useTemporaryDirectory} from 'ava-patterns'
import install from 'quick-install'
import {closeBrowser, openTab, evalInTab} from 'puppet-strings'
import {openChrome} from 'puppet-strings-chrome'
import {Logger, startServer, stopServer, compose} from './index.js'
import serveUi from 'passing-notes-ui'

test('running in the browser', async (t) => {
  await install(process.cwd(), process.cwd())

  const directory = await useTemporaryDirectory(t)
  await directory.writeFile(
    'index.html',
    `
    <!doctype html>
    <meta charset="utf-8">
    <script type="module" src="/index.js"></script>
  `
  )
  await directory.writeFile(
    'index.js',
    `
    import {sendRequest} from 'passing-notes'

    async function run() {
      const response = await sendRequest({
        method: 'GET',
        url: '/message'
      })

      document.body.textContent = JSON.stringify(response, null, 2)
    }
    run()
  `
  )

  const logger = new Logger()
  logger.on('log', (event, line) => console.log(line))
  const server = await startServer(
    {port: 10020},
    compose(
      (next) => (request) => {
        if (request.url !== '/message') {
          return next(request)
        }

        return {
          status: 200,
          headers: {
            'Content-Type': 'text/plain'
          },
          body: 'Hello World!'
        }
      },
      serveUi({path: directory.path, logger}),
      () => () => ({status: 404})
    )
  )
  t.teardown(async () => {
    await stopServer(server)
  })

  const browser = await openChrome()
  t.teardown(async () => {
    await closeBrowser(browser)
  })

  const tab = await openTab(browser, 'http://localhost:10020')

  t.like(
    JSON.parse(await evalInTab(tab, [], 'return document.body.textContent')),
    {
      status: 200,
      headers: {
        'content-type': 'text/plain'
      },
      body: 'Hello World!'
    }
  )
})
