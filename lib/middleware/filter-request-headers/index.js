/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import { omit } from 'lodash'

export default function(next: Responder): Responder {
  return request =>
    next({
      ...request,
      headers: omit(request.headers, ['user-agent', 'content-length'])
    })
}
