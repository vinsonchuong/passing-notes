/* @flow */
import { respondToRequests, serveRpc, serveUi } from 'passing-notes'

export default respondToRequests(
  serveRpc({
    getItems() {
      return ['Item 1', 'Item 2', 'Item 3']
    }
  }),
  serveUi('ui/index.html')
)
