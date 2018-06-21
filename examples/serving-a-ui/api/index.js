/* @flow */
import { respondToRequests, defineRpc, serveUi } from 'passing-notes'
import { printLog } from 'passing-notes/lib/log'
import * as actions from '../domain'

const { serveRpc, sendRpc } = defineRpc(actions)

export default respondToRequests(
  serveRpc,
  serveUi({ entry: 'ui/index.html', log: printLog })
)

export { sendRpc }
