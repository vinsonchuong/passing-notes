/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import { omit } from 'lodash'

export default function(next: Responder): Responder {
  return request =>
    next({
      ...request,
      headers: omit(request.headers, [
        // Client
        'accept',
        'user-agent',

        // Connection
        'connection',
        'content-length',

        // Compression
        'accept-encoding'
      ])
    })
}
