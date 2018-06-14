/* @flow */
import type { Responder } from 'passing-notes/lib/http'

export default function(next: Responder): Responder {
  return async request => {
    try {
      return await next(request)
    } catch (error) {
      return {
        status: 500,
        headers: {
          'content-length': '0'
        },
        body: ''
      }
    }
  }
}
