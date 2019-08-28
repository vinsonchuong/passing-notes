#!/usr/bin/env node
/* @flow */
import 'dotenv/config'
import * as path from 'path'
import { startServer } from 'passing-notes/lib/node'
import { getPort } from 'passing-notes/lib/environment'
import {
  requireAndCompile,
  hotRequireAndCompile
} from 'passing-notes/lib/require'
import { printLog } from 'passing-notes/lib/log'
import { pathExists } from 'fs-extra'
import filenamify from 'filenamify'

async function run() {
  const applicationPath = process.argv[2] || 'server.js'
  const precompilePath = path.resolve('dist', filenamify(applicationPath))
  const port = await getPort()

  await pathExists(precompilePath)
  const application =
    process.env.NODE_ENV === 'production'
      ? (await pathExists(precompilePath))
        ? requireAndCompile({
            modulePath: path.resolve(applicationPath),
            log: printLog
          }) || {}
        : require(precompilePath)
      : hotRequireAndCompile({
          baseDirectory: path.resolve(),
          modulePath: path.resolve(applicationPath),
          log: printLog
        })

  await startServer(
    port,
    (request, response) => {
      if (application.http) {
        application.http(request, response)
      } else if (application.default) {
        application.default(request, response)
      } else {
        response.end()
      }
    },
    (request, socket, head) => {
      if (application.webSocket) {
        application.webSocket(request, socket, head)
      } else {
        socket.end()
      }
    }
  )

  printLog({ type: 'CLI', message: `Listening at http://localhost:${port}` })
}

run()
