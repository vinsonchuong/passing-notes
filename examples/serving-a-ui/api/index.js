/* @flow */
import {
  respondToRequests,
  logRequestsAndResponses,
  defineRpc,
  serveUi
} from 'passing-notes'
import { printLog } from 'passing-notes/lib/log'
import * as actions from '../domain'

const { serveRpc, api, sendRpc } = defineRpc(actions)

const dependencies = {
  log: printLog
}

export default respondToRequests(
  logRequestsAndResponses({ ...dependencies }),
  serveRpc({ ...dependencies }),
  serveUi({ ...dependencies, entry: 'ui/index.html' })
)

export { api, sendRpc }
