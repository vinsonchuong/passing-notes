/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import { promisify } from 'util'
import * as path from 'path'
import * as fs from 'fs'
import waitForEvent from 'promisify-event'
import Bundler from 'parcel-bundler'
import JsAsset from 'passing-notes/lib/parcel/JSAsset'

const dist = path.resolve('dist')
const readFile = promisify(fs.readFile)

function getParcelConfig() {
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

export default function(entryPoint: string): Responder => Responder {
  const bundler = new Bundler(entryPoint, getParcelConfig())
  bundler.addAssetType('js', JsAsset.path)
  bundler.bundle()

  return next => {
    return async request => {
      if (bundler.pending) {
        await waitForEvent(bundler, 'bundled')
      }

      if (request.url === '/') {
        return {
          status: 200,
          headers: {},
          body: await readFile(path.join(dist, 'index.html'), 'utf8')
        }
      } else {
        return {
          status: 200,
          headers: {},
          body: await readFile(path.join(dist, request.url), 'utf8')
        }
      }
    }
  }
}
