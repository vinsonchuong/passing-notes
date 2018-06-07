/* @flow */
import { liftRequest } from 'passing-notes/lib/http'
import {
  combine,
  filterHeaders,
  resolveAbsoluteUrl,
  serializeJsonRequest
} from 'passing-notes/lib/middleware'

export default combine(resolveAbsoluteUrl, serializeJsonRequest, filterHeaders)(
  liftRequest
)
