/* @flow */
import { flow } from 'lodash'
import { liftRequest } from 'passing-notes/src/http'
import { filterHeaders } from 'passing-notes/src/middleware'

export default flow([filterHeaders])(liftRequest)
