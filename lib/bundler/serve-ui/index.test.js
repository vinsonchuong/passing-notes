/* @flow */
import test from 'ava'
import * as path from 'path'
import { withBrowser } from 'passing-notes/test/fixtures'
import { openTab, findElement } from 'puppet-strings'
import {
  startServer,
  stopServer,
  respondToRequests
} from 'passing-notes/lib/http'
import { serveUi } from 'passing-notes/lib/bundler'
import getStream from 'get-stream'

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
    10080,
    respondToRequests(serveUi({ entry: htmlFixturePath, log: () => {} }))
  )
  const tab = await openTab(browser, 'http://localhost:10080')
  t.truthy(await findElement(tab, 'div', 'Hello World!'))

  await stopServer(server)
})

test('setting Cache-Control headers', async t => {
  const respond = serveUi({ entry: htmlFixturePath, log: () => {} })(
    request => {
      throw new Error('Should not be delegating')
    }
  )

  const htmlResponse = await respond({
    method: 'GET',
    url: '/',
    headers: {},
    body: ''
  })
  t.is(htmlResponse.headers['cache-control'], 'no-cache')

  if (typeof htmlResponse.body === 'string') {
    t.fail()
  } else if (htmlResponse.body instanceof Buffer) {
    t.fail()
  } else {
    const body = await getStream(htmlResponse.body)
    const match = body.match(/fixtures\.[a-z0-9]{8}\.js/)
    if (!match) {
      return t.fail()
    }
    const [jsFile] = match

    const jsResponse = await respond({
      method: 'GET',
      url: `/${jsFile}`,
      headers: {},
      body: ''
    })
    t.is(jsResponse.headers['cache-control'], 'max-age=31536000')
  }
})
