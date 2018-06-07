/* @flow */
import { liftRequest } from 'passing-notes/lib/http'
import {
  combine,
  filterResponseHeaders,
  resolveAbsoluteUrl,
  serializeJsonRequest
} from 'passing-notes/lib/middleware'

export default combine(
  resolveAbsoluteUrl,
  serializeJsonRequest,
  filterResponseHeaders,
  next => liftRequest
)(() => ({ status: 404, headers: {}, body: null }))
