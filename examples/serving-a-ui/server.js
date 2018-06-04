/* @flow */
import { combine, respondToRequests, serveUi } from 'passing-notes'

export default combine(respondToRequests, serveUi('index.html'))(request => {
  throw new Error('Should not be delegating')
})
