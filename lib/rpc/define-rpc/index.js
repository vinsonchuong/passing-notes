/* @flow */
/* eslint-disable flowtype/no-weak-types */
import type { Responder } from 'passing-notes/lib/http'
import type { Json } from 'passing-notes/lib/rpc'
import type { Log } from 'passing-notes/lib/log'
import * as url from 'url'
import { sendRequest } from 'passing-notes/lib/http'
import {
  ok,
  badRequest,
  unprocessableEntity,
  internalServerError
} from 'passing-notes/lib/rpc/http-responses'

type Config = {
  log: (Log, ?Log) => void
}

export default function<Actions: { [string]: Function }>(
  actions: Actions
): {
  serveRpc: Config => Responder => Responder,
  sendRpc: <
    Action: $Keys<Actions>,
    Params: { [string]: Json },
    Result: $Call<$ElementType<Actions, Action>, Params>
  >({ action: Action, params: Params }) => Promise<Result>
} {
  return {
    serveRpc: ({ log }) => next => async request => {
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

      const startLog = {
        date: new Date(),
        hrtime: process.hrtime(),
        type: 'RPC',
        message: parsedBody.action
      }
      log(startLog)

      try {
        const result = await actions[parsedBody.action](parsedBody.params)

        const finishLog = {
          date: new Date(),
          hrtime: process.hrtime(),
          type: 'RPC',
          message: 'Returned'
        }
        log(startLog, finishLog)

        return ok(result)
      } catch (error) {
        const finishLog = {
          date: new Date(),
          hrtime: process.hrtime(),
          type: 'RPC',
          message: 'Threw an Error',
          error
        }
        log(startLog, finishLog)

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
