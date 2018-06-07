/* @flow */
import type { Responder } from 'passing-notes/lib/http'

export default function(next: Responder): Responder {
  return request => {
    if (
      typeof request.body !== 'string' ||
      request.headers['content-type'] !== 'application/json'
    ) {
      return next(request)
    }

    return next({ ...request, body: JSON.parse(request.body) })
  }
}
