/* @flow */
import type { Responder } from 'passing-notes/src/http'
import { omit } from 'lodash'

export default function(next: Responder): Responder {
  return request =>
    next({
      ...request,
      url: `http://${request.headers.host}${request.url}`,
      headers: omit(request.headers, ['host'])
    })
}
