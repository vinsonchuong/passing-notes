/* @flow */
import {
  respondToRequests,
  logRequestsAndResponses,
  serveRpc,
  serveUi
} from 'passing-notes'
import { printLog } from 'passing-notes/lib/log'
import * as actions from '../domain'

export default respondToRequests(
  logRequestsAndResponses({ log: printLog }),
  serveRpc({ actions, path: '/rpc', log: printLog }),
  serveUi({ log: printLog, entry: 'ui/index.html' })
)
