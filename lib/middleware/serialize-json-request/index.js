/* @flow */
import type { Responder } from 'passing-notes/lib/http'

export default function(next: Responder): Responder {
  return async request => {
    if (!request.body || typeof request.body === 'string') {
      return next(request)
    }

    return next({
      ...request,
      headers: {
        ...request.headers,
        'content-type': 'application/json'
      },
      body: JSON.stringify(request.body)
    })
  }
}
