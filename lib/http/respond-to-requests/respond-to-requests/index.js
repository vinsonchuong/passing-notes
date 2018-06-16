/* @flow */
import type { Responder, NodeRequestHandler } from 'passing-notes/lib/http'
import {
  lift,
  addAuthorityToUrl,
  catchErrors,
  compressBody,
  filterRequestHeaders,
  setContentLength
} from 'passing-notes/lib/http/respond-to-requests'
import { flowRight } from 'lodash'

export default function(
  ...middleware: Array<(Responder) => Responder>
): NodeRequestHandler {
  return flowRight(
    lift,
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
}
