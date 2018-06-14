/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import { omit } from 'lodash'

export default function(next: Responder): Responder {
  return async request => {
    const response = await next(request)
    return {
      ...response,
      headers: omit(response.headers, [
        // Server
        'server',

        // Connection
        'connection',
        'content-length',
        'transfer-encoding',

        // Compression
        'content-encoding',

        // Caching
        'cache-control',
        'date',
        'etag',
        'expires',
        'last-modified',
        'vary'
      ])
    }
  }
}
