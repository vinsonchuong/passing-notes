/* @flow */
import type { LogLine } from 'passing-notes/lib/log'
import type { Responder } from 'passing-notes/lib/http'
import * as url from 'url'

type Dependencies = {
  log: LogLine => void
}

export default function({ log }: Dependencies): Responder => Responder {
  return next => async request => {
    const { pathname = '' } = url.parse(request.url)

    const requestLog = {
      type: 'HTTP',
      message: `${request.method} ${pathname}`
    }
    log(requestLog)

    try {
      const response = await next(request)
      log({
        since: requestLog,
        message: `${response.status}`
      })
      return response
    } catch (error) {
      log({
        since: requestLog,
        message: '500',
        error
      })
      throw error
    }
  }
}
