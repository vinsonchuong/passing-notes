/* eslint-disable flowtype/no-weak-types */
/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import type { RpcAction } from 'passing-notes/lib/rpc'
import * as url from 'url'
import {
  ok,
  badRequest,
  unprocessableEntity,
  internalServerError
} from './http-responses'

export default function(actions: {
  [string]: RpcAction
}): Responder => Responder {
  return next => async request => {
    const { pathname } = url.parse(request.url)

    if (request.method !== 'POST' || pathname !== '/rpc') return next(request)

    if (!request.body) return badRequest('Missing HTTP Request Body')
    const parsedBody = JSON.parse(request.body)

    if (!parsedBody.action) return badRequest('Missing RPC Action')
    if (!parsedBody.params) return badRequest('Missing RPC Params')
    if (!actions[parsedBody.action])
      return unprocessableEntity('Unknown Action')
    if (actions[parsedBody.action].length !== parsedBody.params.length)
      return unprocessableEntity('Incorrect Number of Parameters')

    try {
      return ok(await actions[parsedBody.action](...parsedBody.params))
    } catch (error) {
      return internalServerError(error.message)
    }
  }
}
