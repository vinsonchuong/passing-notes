/* @flow */
import { respondToRequests, defineRpc, serveUi } from 'passing-notes'
import { printLog } from 'passing-notes/lib/log'
import * as actions from '../domain'

const { serveRpc, api, sendRpc } = defineRpc(actions)

export default respondToRequests(
  serveRpc({ log: printLog }),
  serveUi({ entry: 'ui/index.html', log: printLog })
)

export { api, sendRpc }
