/* @flow */
import { flow } from 'lodash'
import { liftRequest } from 'passing-notes/lib/http'
import { filterHeaders, resolveAbsoluteUrl } from 'passing-notes/lib/middleware'

export default flow([resolveAbsoluteUrl, filterHeaders])(liftRequest)
