/* @flow */
/* eslint-disable flowtype/no-weak-types, no-unused-vars */
import type { Responder } from 'passing-notes/lib/http'
import type { Json } from 'passing-notes/lib/rpc'
import * as url from 'url'
import { sendRequest } from 'passing-notes/lib/http'
import {
  ok,
  badRequest,
  unprocessableEntity,
  internalServerError
} from 'passing-notes/lib/rpc/http-responses'

type RpcRequest<Action: string, Params: { [string]: Json }> = {
  action: Action,
  params: Params
}

export default function<
  Actions: { [string]: Function },
  Action: string,
  Params: {},
  Result: $Call<$ElementType<Actions, Action>, Params>
>(
  actions: Actions
): {
  serveRpc: Responder => Responder,
  sendRpc: (RpcRequest<Action, Params>) => Promise<Result>
} {
  return {
    serveRpc: next => async request => {
      const { pathname } = url.parse(request.url)

      if (request.method !== 'POST' || pathname !== '/rpc') return next(request)

      if (!request.body) return badRequest('Missing HTTP Request Body')
      if (
        request.headers['content-type'] !== 'application/json' ||
        typeof request.body !== 'string'
      ) {
        return badRequest('HTTP Request Body is not JSON')
      }

      const parsedBody = JSON.parse(request.body)

      if (!parsedBody.action) return badRequest('Missing RPC Action')
      if (!parsedBody.params) return badRequest('Missing RPC Params')
      if (!actions[parsedBody.action])
        return unprocessableEntity('Unknown Action')

      try {
        return ok(await actions[parsedBody.action](parsedBody.params))
      } catch (error) {
        return internalServerError(error.message)
      }
    },

    sendRpc: async rpc => {
      const response = await sendRequest({
        method: 'POST',
        url: '/rpc',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(rpc)
      })

      if (
        response.headers['content-type'] !== 'application/json' ||
        typeof response.body !== 'string'
      ) {
        throw new Error('Server did not respond with JSON')
      }

      return JSON.parse(response.body)
    }
  }
}
