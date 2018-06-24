/* @flow */
import type { Log } from 'passing-notes/lib/log'
import * as path from 'path'
import invalidate from 'invalidate-module'
import chokidar from 'chokidar'

type Config = {
  directory: string,
  log: Log => void
}

export default function({ directory, log }: Config) {
  const watcher = chokidar.watch('*.js', {
    cwd: directory,
    ignored: ['node_modules'],
    ignoreInitial: true
  })

  watcher.on('all', (event, file) => {
    const modulePath = path.resolve(directory, file)
    invalidate(modulePath)

    log({
      date: new Date(),
      hrtime: process.hrtime(),
      type: 'CLI',
      message: 'Reloading API'
    })
  })
}
