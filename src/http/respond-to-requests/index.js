/* @flow */
import type { Responder, NodeRequestHandler } from 'passing-notes/lib/http'
import { liftResponder } from 'passing-notes/lib/http'
import {
  combine,
  compressBody,
  serializeJson,
  setContentLength,
  addAuthorityToUrl
} from 'passing-notes/lib/middleware'

export default function(
  ...middleware: Array<(Responder) => Responder>
): NodeRequestHandler {
  return combine(
    liftResponder,
    addAuthorityToUrl,
    setContentLength,
    compressBody,
    serializeJson,
    ...middleware
  )(() => ({
    status: 404,
    headers: {},
    body: null
  }))
}
