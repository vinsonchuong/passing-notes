#!/usr/bin/env node
/* @flow */
import * as path from 'path'
import { startServer, getPort } from 'passing-notes/src/http'
import getBabelConfig from 'passing-notes/src/get-babel-config'
import importModule from 'passing-notes/src/import-module'

async function run() {
  const applicationPath = path.resolve(process.argv[2])

  const userBabelConfig = await getBabelConfig()
  const babelConfig = {
    presets: [require('babel-preset-diff')],
    ...userBabelConfig
  }

  const port = await getPort()
  await startServer(port, (request, response) => {
    const application = importModule(babelConfig, applicationPath)
    application(request, response)
  })
  console.log(`Listening at http://localhost:${port}`)
}

run()
