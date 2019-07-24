/* @flow */
import type { HttpRequestHandler as NodeHttpRequestHandler } from 'passing-notes/lib/node'
import type { Middleware } from 'passing-notes/lib/middleware'
import {
  lift,
  addAuthorityToUrl,
  catchErrors,
  compressBody,
  filterRequestHeaders,
  setContentLength
} from 'passing-notes/lib/http/respond-to-requests'
import { combineMiddleware } from 'passing-notes/lib/middleware'

export default function(
  ...middleware: Array<Middleware>
): NodeHttpRequestHandler {
  return lift(
    combineMiddleware(
      catchErrors,
      addAuthorityToUrl,
      filterRequestHeaders,
      setContentLength,
      compressBody,
      ...middleware
    )(async () => ({
      status: 404,
      headers: {
        'content-length': '0'
      },
      body: ''
    }))
  )
}
