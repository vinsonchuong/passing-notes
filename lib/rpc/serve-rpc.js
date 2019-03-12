/* @flow */
/* eslint-disable flowtype/no-weak-types */
import type { Responder } from 'passing-notes/lib/http'
import type { Log } from 'passing-notes/lib/log'
import parseUrl from 'url-parse'
import {
  ok,
  badRequest,
  unprocessableEntity,
  internalServerError
} from 'passing-notes/lib/rpc/http-responses'

export default function<
  Dependencies: { path: string, log: Log },
  Actions: { [string]: (Dependencies) => Function }
>(dependencies: { actions: Actions } & Dependencies): Responder => Responder {
  const { actions, path, log } = dependencies

  return next => async request => {
    if (request.method !== 'POST' || parseUrl(request.url).pathname !== path) {
      return next(request)
    }

    if (!request.body) return badRequest('Missing HTTP Request Body')
    if (
      request.headers['content-type'] !== 'application/json' ||
      typeof request.body !== 'string'
    ) {
      return badRequest('HTTP Request Body is not JSON')
    }

    const { action, params } = JSON.parse(request.body)

    if (!actions[action]) return unprocessableEntity('Unknown Action')
    if (!Array.isArray(params)) return unprocessableEntity('Missing params')

    const endLog = log({ type: 'RPC', message: action })

    try {
      const result = await actions[action](dependencies)(...params)
      endLog({ message: 'Returned' })
      return ok(result)
    } catch (error) {
      endLog({ message: 'Threw an Error', error })
      return internalServerError(error.message)
    }
  }
}
