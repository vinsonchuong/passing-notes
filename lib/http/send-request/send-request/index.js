/* @flow */
import {
  lift,
  filterResponseHeaders,
  resolveAbsoluteUrl
} from 'passing-notes/lib/http/send-request'
import { combineMiddleware } from 'passing-notes/lib/middleware'

export default combineMiddleware([resolveAbsoluteUrl, filterResponseHeaders])(
  lift
)
