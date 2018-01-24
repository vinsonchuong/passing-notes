#!/usr/bin/env node
/* @flow */
import * as path from 'path'
import { Server } from 'http'
import getPort from 'passing-notes/src/get-port'
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
  const server = new Server()
  server.on('request', (request, response) => {
    const application = importModule(babelConfig, applicationPath)
    application(request, response)
  })
  server.listen(port)

  await new Promise(resolve => {
    server.on('listening', resolve)
  })

  console.log(`Listening at http://localhost:${port}`)
}

run()
