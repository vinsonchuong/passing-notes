/* @flow */
import type { Responder, NodeRequestHandler } from 'passing-notes/lib/http'
import { liftResponder } from 'passing-notes/lib/http'
import {
  combine,
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
    addAuthorityToUrl,
    filterRequestHeaders,
    deserializeJsonRequest,
    setContentLength,
    compressBody,
    serializeJsonResponse,
    ...middleware
  )(() => ({
    status: 404,
    headers: {},
    body: null
  }))
}