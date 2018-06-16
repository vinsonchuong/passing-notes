/* @flow */
import {
  lift,
  filterResponseHeaders,
  resolveAbsoluteUrl
} from 'passing-notes/lib/http/send-request'
import { flowRight } from 'lodash'

export default flowRight(resolveAbsoluteUrl, filterResponseHeaders)(lift)
