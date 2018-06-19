/* @flow */
import type { Log } from 'passing-notes/lib/log'
import Bundler from 'parcel-bundler'
import JsAsset from 'passing-notes/lib/bundler/parcel/JSAsset'
import waitForEvent from 'promisify-event'

const bundlerCache = new Map()

type Config = {
  entry: string,
  outputDirectory: string,
  log: (Log, ?Log) => void
}

export default async function({
  entry,
  outputDirectory,
  log
}: Config): Promise<void> {
  if (bundlerCache.has(entry)) {
    const bundler = bundlerCache.get(entry)
    if (bundler && bundler.pending) {
      await waitForEvent(bundler, 'buildEnd')
    }
  } else {
    const bundler = new Bundler(entry, getParcelConfig(outputDirectory))
    bundlerCache.set(entry, bundler)
    bundler.addAssetType('js', JsAsset.path)

    let startLog
    bundler.on('buildStart', () => {
      startLog = {
        date: new Date(),
        hrtime: process.hrtime(),
        type: 'UI',
        message: 'Compiling UI...'
      }
      log(startLog)
    })
    bundler.on('buildEnd', () => {
      if (bundler.error) {
        bundler.error.message += `\n${bundler.error.highlightedCodeFrame}`

        const endLog = {
          date: new Date(),
          hrtime: process.hrtime(),
          type: 'UI',
          message: 'Failed',
          error: bundler.error
        }
        log(startLog, endLog)
      } else {
        const endLog = {
          date: new Date(),
          hrtime: process.hrtime(),
          type: 'UI',
          message: 'Finished'
        }
        log(startLog, endLog)
      }
    })

    bundler.bundle()
    await waitForEvent(bundler, 'buildEnd')
  }
}

function getParcelConfig(outputDirectory) {
  if (process.env.NODE_ENV === 'test') {
    return {
      outDir: outputDirectory,
      publicUrl: '/',
      logLevel: 0,
      cache: false
    }
  } else {
    return {
      outDir: outputDirectory,
      publicUrl: '/',
      logLevel: 0
    }
  }
}
