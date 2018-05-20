/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import isAbsoluteUrl from 'is-absolute-url'

export default function(next: Responder): Responder {
  return async request => {
    if (isAbsoluteUrl(request.url)) {
      return next(request)
    }

    return next({
      ...request,
      url: `http://${window.location.host}${request.url}`
    })
  }
}
