/* @flow */
import type { Responder, NodeRequestHandler } from 'passing-notes/lib/http'
import { liftResponder } from 'passing-notes/lib/http'
import {
  combine,
  catchErrors,
  compressBody,
  deserializeJsonRequest,
  filterRequestHeaders,
  serializeJsonResponse,
  setContentLength,
  addAuthorityToUrl
} from 'passing-notes/lib/middleware'

export default function(
  ...middleware: Array<(Responder) => Responder>
): NodeRequestHandler {
  return combine(
    liftResponder,
    catchErrors,
    addAuthorityToUrl,
    filterRequestHeaders,
    deserializeJsonRequest,
    setContentLength,
    compressBody,
    serializeJsonResponse,
    ...middleware
  )(() => ({
    status: 404,
    headers: {
      'content-length': '0'
    },
    body: ''
  }))
}
