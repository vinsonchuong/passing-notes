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
  Dependencies: { path: string, log: (Log, ?Log) => void },
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

    const startLog = {
      date: new Date(),
      hrtime: process.hrtime(),
      type: 'RPC',
      message: action
    }
    log(startLog)

    try {
      const result = await actions[action](dependencies)(...params)

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
  }
}
