#!/usr/bin/env node
/* @flow */
import * as path from 'path'
import { startServer, getPort } from 'passing-notes/lib/http'
import { getBabelConfig, importModule } from 'passing-notes/lib/babel'

async function run() {
  const applicationPath = path.resolve(process.argv[2] || 'server.js')
  const babelConfig = await getBabelConfig(path.resolve())

  const port = await getPort()
  await startServer(port, (request, response) => {
    const application = importModule(babelConfig, applicationPath)
    application(request, response)
  })
  console.log(`Listening at http://localhost:${port}`)

  importModule(babelConfig, applicationPath)
}

run()
