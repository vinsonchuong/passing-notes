/* @flow */
import ava from 'ava'
import { flow } from 'lodash'
import { start, stop, sleep } from 'passing-notes/test/helpers'
import {
  withExampleProject,
  withGlobalBrowser
} from 'passing-notes/test/fixtures'
import { openTab, findElement } from 'puppet-strings'

const test = flow(
  withGlobalBrowser,
  withExampleProject({ fixtureName: 'serving-a-ui' })
)(ava)

test('serving a UI', async t => {
  const { browser } = global
  const { project } = t.context

  const server = await start(['yarn', 'start'], {
    cwd: project.directory,
    env: { PORT: '30000' },
    waitForOutput: 'Listening'
  })

  while (!server.stdout.includes('Compiling UI... › Finished')) {
    await sleep(1000)
  }

  try {
    const tab = await openTab(browser, 'http://localhost:30000')
    t.truthy(await findElement(tab, 'div', 'Item 1'))
    t.truthy(await findElement(tab, 'div', 'Item 2'))
    t.truthy(await findElement(tab, 'div', 'Item 3'))
  } catch (error) {
    t.log(server.stdout)
    throw error
  } finally {
    await stop(server)
  }
})
