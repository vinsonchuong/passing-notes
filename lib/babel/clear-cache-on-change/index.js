/* @flow */
import * as path from 'path'
import invalidate from 'invalidate-module'
import chokidar from 'chokidar'

export default function(directory: string) {
  const watcher = chokidar.watch('*.js', {
    cwd: directory,
    ignored: ['node_modules'],
    ignoreInitial: true
  })

  watcher.on('all', (event, file) => {
    const modulePath = path.resolve(directory, file)
    invalidate(modulePath)
  })
}
