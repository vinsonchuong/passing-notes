/* eslint-disable flowtype/no-weak-types */
/* @flow */
import { start, stop, writeFile, sleep } from 'passing-notes/test/helpers'
import { openChrome, closeBrowser, openTab, evalInTab } from 'puppet-strings'
import { getPort } from 'passing-notes/lib/http'
import tempy from 'tempy'
import { ensureDir, remove } from 'fs-extra'
import { promisify } from 'util'
import * as childProcess from 'child_process'

const exec = promisify(childProcess.exec)

export default async function(moduleContents: string): Promise<any> {
  const passingNotes = tempy.directory()
  await ensureDir(passingNotes)
  await exec(`yarn build-esm ${passingNotes}`)

  const directory = await tempy.directory()
  await ensureDir(directory)
  await exec(`yarn add --dev ${passingNotes}`, { cwd: directory })

  try {
    await writeFile(
      directory,
      'server.js',
      `
      import { respondToRequests, serveUi } from 'passing-notes'
      import { printLog } from 'passing-notes/lib/log'
      export default respondToRequests(
        serveUi({ entry: 'index.html', log: printLog })
      )
    `
    )

    await writeFile(
      directory,
      'index.html',
      `
      <!doctype html>
      <meta charset="utf-8">
      <script async src="index.js"></script>
      `
    )

    await writeFile(directory, 'user-module.js', moduleContents)

    await writeFile(
      directory,
      'index.js',
      `
      import fn from './user-module'
      window.fn = fn
      `
    )

    const port = await getPort()
    const server = await start(['yarn', 'pass-notes', 'server.js'], {
      cwd: directory,
      env: { PORT: port.toString() },
      waitForOutput: 'Listening'
    })

    while (!server.stdout.includes('Compiling UI... › Finished')) {
      await sleep(1000)
    }

    const browser = await openChrome()
    try {
      const tab = await openTab(browser, `http://localhost:${port}`)
      return await evalInTab(tab, [], 'return window.fn()')
    } finally {
      await closeBrowser(browser)
      await stop(server)
    }
  } finally {
    await remove(passingNotes)
    await remove(directory)
  }
}
