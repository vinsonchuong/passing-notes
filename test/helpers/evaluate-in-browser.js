/* eslint-disable flowtype/no-weak-types */
/* @flow */
import { start, stop, writeFile } from 'passing-notes/test/helpers'
import * as withBrowser from 'passing-notes/test/fixtures/with-browser'
import * as withProject from 'passing-notes/test/fixtures/with-project'
import { openTab, evalInTab } from 'puppet-strings'
import { getPort } from 'passing-notes/lib/http'

export default async function(moduleContents: string): Promise<any> {
  const project = await withProject.setup()
  try {
    await writeFile(
      project.directory,
      'server.js',
      `
      import { liftResponder } from 'passing-notes/lib/http'
      import { combine, serveUi } from 'passing-notes/lib/middleware'

      export default combine(
        liftResponder,
        serveUi('index.html')
      )(() => {
        throw new Error('Unexpected request')
      })
    `
    )

    await writeFile(
      project.directory,
      'index.html',
      `
      <!doctype html>
      <meta charset="utf-8">
      <script async src="index.js"></script>
      `
    )

    await writeFile(project.directory, 'user-module.js', moduleContents)

    await writeFile(
      project.directory,
      'index.js',
      `
      import fn from './user-module'
      window.fn = fn
      `
    )

    const port = await getPort()
    const server = await start(['yarn', 'pass-notes', 'server.js'], {
      cwd: project.directory,
      env: { PORT: port.toString() },
      waitForOutput: 'Listening'
    })
    const browser = await withBrowser.setup()
    try {
      const tab = await openTab(browser, `http://localhost:${port}`)
      return await evalInTab(tab, [], 'return window.fn()')
    } finally {
      await withBrowser.teardown(browser)
      await stop(server)
    }
  } finally {
    await withProject.teardown(project)
  }
}
