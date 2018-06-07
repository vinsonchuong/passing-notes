/* @flow */
import test from 'ava'
import { start, stop } from 'passing-notes/test/helpers'
import { withExampleProject, withBrowser } from 'passing-notes/test/fixtures'
import { openTab, findElement } from 'puppet-strings'

withExampleProject({
  perTest: true,
  key: 'project',
  fixtureName: 'serving-a-ui'
})

withBrowser({ perTest: false, key: 'browser' })

test('serving a UI', async t => {
  const { browser } = global
  const { project } = t.context

  const server = await start(['yarn', 'start'], {
    cwd: project.directory,
    env: { PORT: '30000' },
    waitForOutput: 'Listening'
  })

  const tab = await openTab(browser, 'http://localhost:30000')
  try {
    t.truthy(await findElement(tab, 'div', 'Item 1'))
    t.truthy(await findElement(tab, 'div', 'Item 2'))
    t.truthy(await findElement(tab, 'div', 'Item 3'))
  } finally {
    tab.console.map(console.log)
    console.log('===')
    tab.errors.map(console.log)
  }

  await stop(server)
})
