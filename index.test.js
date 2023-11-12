import process from 'node:process'
import test from 'ava'
import {useTemporaryDirectory} from 'ava-patterns'
import install from 'quick-install'
import {closeBrowser, openTab, findElement} from 'puppet-strings'
import {openChrome} from 'puppet-strings-chrome'
import serveUi from 'passing-notes-ui'
import {Logger, startServer, stopServer, compose} from './index.js'

test('running in the browser', async (t) => {
  await install(process.cwd(), process.cwd())

  const directory = await useTemporaryDirectory(t)
  await directory.writeFile(
    'index.html',
    `
    <!doctype html>
    <meta charset="utf-8">
    <script type="module" src="/index.js"></script>
  `,
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
  `,
  )

  const logger = new Logger()
  logger.on('log', (event, line) => t.log(line))
  const server = await startServer(
    {port: 10_020},
    compose(
      (next) => (request) => {
        if (request.url !== '/message') {
          return next(request)
        }

        return {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
          },
          body: 'Hello World!',
        }
      },
      serveUi({path: directory.path, logger}),
      () => () => ({status: 404}),
    ),
  )
  t.teardown(async () => {
    await stopServer(server)
  })

  const browser = await openChrome()
  t.teardown(async () => {
    await closeBrowser(browser)
  })

  const tab = await openTab(browser, 'http://localhost:10020')

  const body = await findElement(tab, 'body', 'Hello World!')
  t.like(JSON.parse(body.textContent), {
    status: 200,
    headers: {
      'content-type': 'text/plain',
    },
    body: 'Hello World!',
  })
})

test('supporting streaming server-sent events in the browser', async (t) => {
  await install(process.cwd(), process.cwd())

  const directory = await useTemporaryDirectory(t)
  await directory.writeFile(
    'index.html',
    `
    <!doctype html>
    <meta charset="utf-8">
    <script type="module" src="/index.js"></script>
  `,
  )
  await directory.writeFile(
    'index.js',
    `
    import {sendRequest} from 'passing-notes'

    async function run() {
      const response = await sendRequest({
        method: 'GET',
        url: '/events'
      })
      response.body
        .pipeThrough(new TextDecoderStream())
        .pipeTo(new WritableStream({
          write(chunk) {
            document.body.textContent += chunk
          }
        }))
    }
    run()
  `,
  )

  const logger = new Logger()
  logger.on('log', (event, line) => t.log(line))
  const server = await startServer(
    {port: 10_021},
    compose(
      (next) => (request) => {
        if (request.url !== '/events') {
          return next(request)
        }

        return {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
          },
          body: [
            ': comment\n',
            '\n',
            'data: some text\n',
            '\n',
            'data: multiple\n',
            'data: lines\n',
            '\n',
            'event: foo\n',
            'data: bar\n',
            '\n',
          ].join(''),
        }
      },
      serveUi({path: directory.path, logger}),
      () => () => ({status: 404}),
    ),
  )
  t.teardown(async () => {
    await stopServer(server)
  })

  const browser = await openChrome()
  t.teardown(async () => {
    await closeBrowser(browser)
  })

  const tab = await openTab(browser, 'http://localhost:10021')
  const body = await findElement(tab, 'body', 'bar')
  t.is(
    body.textContent,
    [
      ': comment\n',
      '\n',
      'data: some text\n',
      '\n',
      'data: multiple\n',
      'data: lines\n',
      '\n',
      'event: foo\n',
      'data: bar\n',
      '\n',
    ].join(''),
  )
})
