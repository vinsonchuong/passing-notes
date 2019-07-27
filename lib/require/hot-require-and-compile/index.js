/* @flow */
import type { Log } from 'passing-notes/lib/log'
import * as path from 'path'
import chokidar from 'chokidar'
import { requireAndCompile } from '../'

type Config = {
  baseDirectory: string,
  modulePath: string,
  log: Log
}

export default function<Module>({
  baseDirectory,
  modulePath,
  log
}: Config): Module {
  const invalidateModule = require('invalidate-module')
  const absoluteModulePath = require.resolve(modulePath)

  let currentModule = {}

  currentModule = requireAndCompile({ modulePath, log }) || currentModule

  const watcher = chokidar.watch('**/*.js', {
    cwd: baseDirectory,
    ignored: ['dist', 'node_modules'],
    ignoreInitial: true
  })
  watcher.on('all', (event, updatedFilePath) => {
    const absoluteUpdatedFilePath = path.resolve(baseDirectory, updatedFilePath)
    invalidateModule(absoluteUpdatedFilePath)

    if (!(absoluteModulePath in require.cache)) {
      currentModule = requireAndCompile({ modulePath, log }) || currentModule
    }
  })

  // $FlowFixMe
  return new Proxy(
    {},
    {
      get(_, property) {
        return currentModule[property]
      }
    }
  )
}
