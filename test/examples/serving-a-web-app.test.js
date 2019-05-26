/* @flow */
import test from 'ava'
import { start, stop, sleep } from 'passing-notes/test/helpers'
import { withExampleProject, withBrowser } from 'passing-notes/test/fixtures'
import { openTab, findElement } from 'puppet-strings'

const testWithProject = withExampleProject(test, 'serving-a-web-app')
const testWithProjectAndBrowser = withBrowser(testWithProject)

testWithProjectAndBrowser('serving a web app', async t => {
  const { project, browser } = t.context

  const server = await start(['yarn', 'start'], {
    cwd: project,
    env: { PORT: '30000' },
    waitForOutput: 'Listening'
  })

  while (!server.stdout.includes('Compiling UI... › Finished')) {
    console.log(server.stdout)
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
