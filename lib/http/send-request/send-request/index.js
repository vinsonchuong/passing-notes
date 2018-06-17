/* @flow */
import {
  lift,
  filterResponseHeaders,
  resolveAbsoluteUrl
} from 'passing-notes/lib/http/send-request'
import { combine } from 'passing-notes/lib/middleware'

export default combine([resolveAbsoluteUrl, filterResponseHeaders])(lift)
