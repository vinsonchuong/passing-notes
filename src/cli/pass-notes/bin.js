#!/usr/bin/env node
/* @flow */
import 'dotenv/config'
import * as path from 'path'
import { startServer } from 'passing-notes/lib/node'
import { getPort } from 'passing-notes/lib/environment'
import { importModule, clearCacheOnChange } from 'passing-notes/lib/babel'
import { printLog } from 'passing-notes/lib/log'

async function run() {
  const applicationPath = path.resolve(process.argv[2] || 'server.js')
  const port = await getPort()

  if (process.env.NODE_ENV === 'production') {
    const application = importAndLogErrors(applicationPath)
    await startServer(port, application)
  } else {
    clearCacheOnChange({ directory: path.resolve(), log: printLog })
    importAndLogErrors(applicationPath)

    await startServer(port, (request, response) => {
      const application = importAndLogErrors(applicationPath)
      application(request, response)
    })
  }

  printLog({ type: 'CLI', message: `Listening at http://localhost:${port}` })
}

function importAndLogErrors(modulePath) {
  try {
    return importModule(modulePath)
  } catch (error) {
    printLog({ type: 'CLI', message: 'Failed to import API definition', error })
    process.exit(1)
    throw new Error('Exiting Process') // eslint-disable-line
  }
}

run()
