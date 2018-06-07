/* @flow */
import { liftRequest as liftHttpRequest } from 'passing-notes/lib/http'
import { liftRequest as liftRpcRequest } from 'passing-notes/lib/rpc'
import {
  combine,
  filterResponseHeaders,
  resolveAbsoluteUrl,
  serializeJsonRequest
} from 'passing-notes/lib/middleware'

export default combine(
  liftRpcRequest,
  resolveAbsoluteUrl,
  serializeJsonRequest,
  filterResponseHeaders,
  next => liftHttpRequest
)(() => ({ status: 404, headers: {}, body: null }))
