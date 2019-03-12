/* @flow */
import type { Log } from 'passing-notes/lib/log'
import * as path from 'path'
import invalidate from 'invalidate-module'
import chokidar from 'chokidar'

type Config = {
  directory: string,
  log: Log
}

export default function({ directory, log }: Config) {
  const watcher = chokidar.watch('**/*.js', {
    cwd: directory,
    ignored: ['dist', 'node_modules'],
    ignoreInitial: true
  })

  watcher.on('all', (event, file) => {
    const modulePath = path.resolve(directory, file)
    invalidate(modulePath)

    if (modulePath in require.cache) {
      log({ type: 'CLI', message: 'Reloading API' })
    }
  })
}
