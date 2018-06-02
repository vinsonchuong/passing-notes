/* @flow */
import { liftRequest } from 'passing-notes/lib/http'
import {
  combine,
  filterHeaders,
  resolveAbsoluteUrl
} from 'passing-notes/lib/middleware'

export default combine([resolveAbsoluteUrl, filterHeaders])(liftRequest)
