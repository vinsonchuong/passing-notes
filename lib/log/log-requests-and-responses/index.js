/* @flow */
import type { Log } from 'passing-notes/lib/log'
import type { Responder } from 'passing-notes/lib/http'
import * as url from 'url'

type Config = {
  log: (Log, ?Log) => void
}

export default function({ log }: Config): Responder => Responder {
  return next => async request => {
    const { pathname = '' } = url.parse(request.url)

    const requestLog = {
      date: new Date(),
      hrtime: process.hrtime(),
      type: 'HTTP',
      message: `${request.method} ${pathname}`
    }
    log(requestLog)

    try {
      const response = await next(request)

      const responseLog = {
        date: new Date(),
        hrtime: process.hrtime(),
        type: 'HTTP',
        message: `${response.status}`
      }
      log(requestLog, responseLog)

      return response
    } catch (error) {
      const responseLog = {
        date: new Date(),
        hrtime: process.hrtime(),
        type: 'HTTP',
        message: '500',
        error
      }
      log(requestLog, responseLog)

      throw error
    }
  }
}
