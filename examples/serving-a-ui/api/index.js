/* @flow */
import { respondToRequests, serveRpc, serveUi } from 'passing-notes'
import { printLog } from 'passing-notes/lib/log'

export default respondToRequests(
  serveRpc({
    getItems() {
      return ['Item 1', 'Item 2', 'Item 3']
    }
  }),
  serveUi({ entry: 'ui/index.html', log: printLog })
)
