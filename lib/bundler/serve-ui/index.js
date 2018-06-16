/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import { generateBundle } from 'passing-notes/lib/bundler'
import { serveStatic } from 'passing-notes/lib/middleware'
import * as path from 'path'
import filenamify from 'filenamify'
import contentType from 'content-type'
import { flowRight } from 'lodash'

export default function(entryPoint: string): Responder => Responder {
  const outputDirectory = path.join('dist', filenamify(entryPoint))

  return flowRight(
    cacheResponse,
    waitForBundle(entryPoint, outputDirectory),
    serveStatic(outputDirectory)
  )
}

function waitForBundle(
  entryPoint: string,
  outputDirectory: string
): Responder => Responder {
  generateBundle(entryPoint, outputDirectory)
  return next => async request => {
    await generateBundle(entryPoint, outputDirectory)
    return next(request)
  }
}

function cacheResponse(next: Responder): Responder {
  return async request => {
    const response = await next(request)
    const { type } = contentType.parse(response.headers['content-type'])

    return {
      ...response,
      headers: {
        ...response.headers,
        'cache-control': type === 'text/html' ? 'no-cache' : 'max-age=31536000'
      }
    }
  }
}
