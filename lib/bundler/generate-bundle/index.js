/* @flow */
import Bundler from 'parcel-bundler'
import JsAsset from 'passing-notes/lib/bundler/parcel/JSAsset'
import waitForEvent from 'promisify-event'

const bundlerCache = new Map()

export default async function(
  entryPoint: string,
  outputDirectory: string
): Promise<void> {
  if (bundlerCache.has(entryPoint)) {
    const bundler = bundlerCache.get(entryPoint)
    if (bundler && bundler.pending) {
      await waitForEvent(bundler, 'bundled')
    }
  } else {
    const bundler = new Bundler(entryPoint, getParcelConfig(outputDirectory))
    bundlerCache.set(entryPoint, bundler)
    bundler.addAssetType('js', JsAsset.path)
    bundler.bundle()
    await waitForEvent(bundler, 'bundled')
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
      publicUrl: '/'
    }
  }
}
