/* eslint-disable flowtype/no-weak-types */
/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import type { RpcAction } from 'passing-notes/lib/rpc'
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
    if (request.method !== 'POST' || request.url !== '/rpc')
      return next(request)

    if (!request.body) return badRequest('Missing HTTP Request Body')
    if (!request.body.action) return badRequest('Missing RPC Action')
    if (!request.body.params) return badRequest('Missing RPC Params')
    if (!actions[request.body.action])
      return unprocessableEntity('Unknown Action')
    if (actions[request.body.action].length !== request.body.params.length)
      return unprocessableEntity('Incorrect Number of Parameters')

    try {
      return ok(await actions[request.body.action](...request.body.params))
    } catch (error) {
      return internalServerError(error.message)
    }
  }
}
