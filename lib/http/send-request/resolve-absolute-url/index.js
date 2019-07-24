/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import { getPort } from 'passing-notes/lib/environment'
import isAbsoluteUrl from 'is-absolute-url'

export default function(next: Responder): Responder {
  return async request => {
    if (isAbsoluteUrl(request.url)) {
      return next(request)
    }

    const port = await getPort()
    return next({
      ...request,
      url: `http://localhost:${port}${request.url}`
    })
  }
}
