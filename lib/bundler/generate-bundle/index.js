/* @flow */
import * as path from 'path'
import Bundler from 'parcel-bundler'
import JsAsset from 'passing-notes/lib/bundler/parcel/JSAsset'
import waitForEvent from 'promisify-event'
import filenamify from 'filenamify'

const bundlerCache = new Map()

export default async function(entryPoint: string): Promise<string> {
  const dist = path.resolve('dist', filenamify(entryPoint))

  if (bundlerCache.has(entryPoint)) {
    const bundler = bundlerCache.get(entryPoint)
    if (bundler && bundler.pending) {
      await waitForEvent(bundler, 'bundled')
    }
  } else {
    const bundler = new Bundler(entryPoint, getParcelConfig(dist))
    bundlerCache.set(entryPoint, bundler)
    bundler.addAssetType('js', JsAsset.path)
    bundler.bundle()
    await waitForEvent(bundler, 'bundled')
  }

  return dist
}

function getParcelConfig(dist) {
  if (process.env.NODE_ENV === 'test') {
    return {
      outDir: dist,
      publicUrl: '/',
      logLevel: 0,
      cache: false
    }
  } else {
    return {
      outDir: dist,
      publicUrl: '/'
    }
  }
}
