/* @flow */
import type { NodeRequestHandler } from 'passing-notes/lib/http'
import type { Middleware } from 'passing-notes/lib/middleware'
import {
  lift,
  addAuthorityToUrl,
  catchErrors,
  compressBody,
  filterRequestHeaders,
  setContentLength
} from 'passing-notes/lib/http/respond-to-requests'
import { combine } from 'passing-notes/lib/middleware'

export default function(...middleware: Array<Middleware>): NodeRequestHandler {
  return lift(
    combine([
      catchErrors,
      addAuthorityToUrl,
      filterRequestHeaders,
      setContentLength,
      compressBody,
      ...middleware
    ])(async () => ({
      status: 404,
      headers: {
        'content-length': '0'
      },
      body: ''
    }))
  )
}
