/* @flow */
import type { Log } from 'passing-notes/lib/log'
import type { Responder } from 'passing-notes/lib/http'
import parseUrl from 'url-parse'

type Config = {
  log: Log
}

export default function({ log }: Config): Responder => Responder {
  return next => async request => {
    const { pathname } = parseUrl(request.url)

    const endLog = log({
      type: 'HTTP',
      message: `${request.method} ${pathname}`
    })

    try {
      const response = await next(request)
      endLog({ message: `${response.status}` })
      return response
    } catch (error) {
      endLog({ message: '500', error })
      throw error
    }
  }
}
