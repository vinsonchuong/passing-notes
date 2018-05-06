/* @flow */
import type { Responder } from 'passing-notes/lib/http'

export default function(next: Responder): Responder {
  return async request => {
    const response = await next(request)
    return {
      ...response,
      headers: {
        ...response.headers,
        'content-length': String(Buffer.byteLength(response.body))
      }
    }
  }
}
