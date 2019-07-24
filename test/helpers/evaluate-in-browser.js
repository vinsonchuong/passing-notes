/* eslint-disable flowtype/no-weak-types */
/* @flow */
import * as childProcess from 'child_process'
import { promisify } from 'util'
import tempy from 'tempy'
import { ensureDir, remove } from 'fs-extra'
import {
  start,
  stop,
  writeFile,
  sleep,
  install
} from 'passing-notes/test/helpers'
import { closeBrowser, openTab, evalInTab } from 'puppet-strings'
import { openChrome } from 'puppet-strings-chrome'
import { getPort } from 'passing-notes/lib/environment'

const exec = promisify(childProcess.exec)

export default async function(moduleContents: string): Promise<any> {
  const project = tempy.directory()
  const passingNotes = tempy.directory()

  await ensureDir(project)
  await ensureDir(passingNotes)

  await exec(`yarn build-esm ${passingNotes}`)
  await install(passingNotes, project)

  await writeFile(
    project,
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
    project,
    'index.html',
    `
    <!doctype html>
    <meta charset="utf-8">
    <script async src="index.js"></script>
    `
  )

  await writeFile(project, 'user-module.js', moduleContents)

  await writeFile(
    project,
    'index.js',
    `
    import fn from './user-module'
    window.fn = fn
    `
  )

  try {
    const port = await getPort()
    const server = await start(['yarn', 'pass-notes', 'server.js'], {
      cwd: project,
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
    await remove(project)
    await remove(passingNotes)
  }
}
