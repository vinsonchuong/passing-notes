/* @flow */
import type { Responder } from 'passing-notes/lib/http'

export default function(next: Responder): Responder {
  return async request => {
    const response = await next(request)

    if (
      typeof response.body !== 'string' &&
      !(response.body instanceof Buffer)
    ) {
      return response
    }

    return {
      ...response,
      headers: {
        ...response.headers,
        'content-length': String(Buffer.byteLength(response.body))
      }
    }
  }
}
