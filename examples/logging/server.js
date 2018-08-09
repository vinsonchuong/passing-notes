/* @flow */
import { respondToRequests, logRequestsAndResponses } from 'passing-notes'
import { printLog } from 'passing-notes/lib/log'

const dependencies = {
  log: printLog
}

export default respondToRequests(
  logRequestsAndResponses({ ...dependencies }),
  next => async request => {
    if (request.url.endsWith('/ping')) {
      return {
        status: 200,
        headers: {},
        body: 'Pong'
      }
    } else {
      throw new Error('Unknown URL')
    }
  }
)
