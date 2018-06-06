/* @flow */
import { respondToRequests, serveUi } from 'passing-notes'

export default respondToRequests(serveUi('index.html'))
