/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import { promisify } from 'util'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import { generateBundle } from 'passing-notes/lib/bundler'

const readFile = promisify(fs.readFile)

export default function(entryPoint: string): Responder => Responder {
  generateBundle(entryPoint)

  return next => {
    return async request => {
      const dist = await generateBundle(entryPoint)

      const { pathname } = url.parse(request.url)

      if (pathname === '/') {
        return {
          status: 200,
          headers: {},
          body: await readFile(path.join(dist, 'index.html'), 'utf8')
        }
      } else if (typeof pathname === 'string') {
        return {
          status: 200,
          headers: {},
          body: await readFile(path.join(dist, pathname), 'utf8')
        }
      } else {
        return next(request)
      }
    }
  }
}
