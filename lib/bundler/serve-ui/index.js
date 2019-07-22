/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import type { Log } from 'passing-notes/lib/log'
import { generateBundle } from 'passing-notes/lib/bundler'
import { serveStaticFiles } from 'passing-notes/lib/static-files'
import * as path from 'path'
import parseUrl from 'url-parse'
import filenamify from 'filenamify'
import contentType from 'content-type'
import { combineMiddleware } from 'passing-notes/lib/middleware'

type Config = {
  entry: string,
  log: Log
}

export default function({ entry, log }: Config): Responder => Responder {
  const outputDirectory = path.join('dist', filenamify(entry))

  return combineMiddleware([
    cacheResponse,
    waitForBundle({ entry, outputDirectory, log }),
    wildcard,
    serveStaticFiles(outputDirectory)
  ])
}

function waitForBundle({ entry, outputDirectory, log }) {
  generateBundle({ entry, outputDirectory, log })
  return next => async request => {
    await generateBundle({ entry, outputDirectory, log })
    return next(request)
  }
}

function cacheResponse(next) {
  return async request => {
    const response = await next(request)

    if (response.status !== 200) {
      return response
    }

    const { type } = contentType.parse(response.headers['content-type'])

    return {
      ...response,
      headers: {
        ...response.headers,
        'cache-control':
          process.env.NODE_ENV !== 'production' || type === 'text/html'
            ? 'no-cache'
            : 'max-age=31536000'
      }
    }
  }
}

function wildcard(next) {
  return async request => {
    const response = await next(request)

    if (response.status === 200) {
      return response
    }

    return next({
      ...request,
      url: parseUrl('request.url')
        .set('pathname', '/')
        .toString()
    })
  }
}
