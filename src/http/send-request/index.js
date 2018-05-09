/* @flow */
import { flow } from 'lodash'
import { liftRequest } from 'passing-notes/lib/http'
import { filterHeaders } from 'passing-notes/lib/middleware/client'

export default flow([filterHeaders])(liftRequest)
