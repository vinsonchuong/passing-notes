#!/usr/bin/env node
/* @flow */
import * as path from 'path'
import { startServer, getPort } from 'passing-notes/lib/http'
import { importModule, clearCacheOnChange } from 'passing-notes/lib/babel'
import { printLog } from 'passing-notes/lib/log'

async function run() {
  const applicationPath = path.resolve(process.argv[2] || 'server.js')

  const port = await getPort()
  await startServer(port, (request, response) => {
    const application = importModule(applicationPath)
    application(request, response)
  })
  printLog({
    date: new Date(),
    hrtime: process.hrtime(),
    type: 'CLI',
    message: `Listening at http://localhost:${port}`
  })

  clearCacheOnChange({ directory: path.resolve(), log: printLog })
  importModule(applicationPath)
}

run()
