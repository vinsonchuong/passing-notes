#!/usr/bin/env node
/* @flow */
import * as path from 'path'
import { Server } from 'http'
import getPort from 'passing-notes/src/get-port'
import getBabelConfig from 'passing-notes/src/get-babel-config'
import interopRequire from 'interop-require'

async function run() {
  const overrides = await getBabelConfig()
  require('babel-register')({
    presets: ['diff'],
    ...overrides
  })

  const port = await getPort()
  const server = new Server()
  // $FlowFixMe
  const application = interopRequire(path.resolve(process.argv[2]))
  server.on('request', application)
  server.listen(port)

  await new Promise(resolve => {
    server.on('listening', resolve)
  })

  console.log(`Listening at http://localhost:${port}`)
}

run()
