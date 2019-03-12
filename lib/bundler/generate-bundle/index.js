/* @flow */
import type { Log } from 'passing-notes/lib/log'
import Bundler from 'parcel-bundler'
import JSAsset from 'passing-notes/lib/bundler/parcel/JSAsset'
import waitForEvent from 'promisify-event'

const bundlerCache = new Map()

type Config = {
  entry: string,
  outputDirectory: string,
  log: Log
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
    bundler.addAssetType('js', JSAsset.path)

    let endLog
    bundler.on('buildStart', () => {
      endLog = log({ type: 'UI', message: 'Compiling UI...' })
    })
    bundler.on('buildEnd', () => {
      if (bundler.error) {
        bundler.error.message += `\n${bundler.error.codeFrame}`
        endLog({ message: 'Failed', error: bundler.error })
      } else {
        endLog({ message: 'Finished' })
      }
    })

    bundler.bundle()
    await waitForEvent(bundler, 'buildEnd')
  }
}

function getParcelConfig(outputDirectory) {
  const baseConfig = {
    outDir: outputDirectory,
    publicUrl: '/',
    autoinstall: false,
    logLevel: 0
  }

  if (process.env.NODE_ENV === 'test') {
    return {
      ...baseConfig,
      cache: false
    }
  } else {
    return baseConfig
  }
}
