/* @flow */
import { flow } from 'lodash'
import { liftRequest } from 'passing-notes/lib/http'
import {
  resolveAbsoluteUrl,
  filterHeaders
} from 'passing-notes/lib/middleware/client'

export default flow([resolveAbsoluteUrl, filterHeaders])(liftRequest)
