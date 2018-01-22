#!/usr/bin/env node
/* @flow */
import * as path from 'path'
import { Server } from 'http'
import { pathExists, readJson } from 'fs-extra'
import getPort from 'passing-notes/src/get-port'
import interopRequire from 'interop-require'

async function run() {
  const overrides = await readBabelConfig()
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

async function readBabelConfig() {
  const packageJson = await readJson(path.resolve('package.json'))
  if ('babel' in packageJson) {
    return packageJson.babel
  } else if (await pathExists(path.resolve('.babelrc'))) {
    return readJson(path.resolve('.babelrc'))
  } else if (await pathExists(path.resolve('.babelrc.js'))) {
    // $FlowFixMe
    return require(path.resolve('.babelrc.js'))
  } else {
    return null
  }
}
