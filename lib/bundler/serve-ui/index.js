/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import { generateBundle } from 'passing-notes/lib/bundler'
import { serveStatic } from 'passing-notes/lib/middleware'

export default function(entryPoint: string): Responder => Responder {
  generateBundle(entryPoint)

  return next => {
    return async request => {
      const dist = await generateBundle(entryPoint)
      return serveStatic(dist)(next)(request)
    }
  }
}
