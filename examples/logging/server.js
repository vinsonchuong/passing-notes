/* @flow */
import { respondToRequests } from 'passing-notes'
import { printLog, logRequestsAndResponses } from 'passing-notes/lib/log'

export default respondToRequests(
  logRequestsAndResponses({ log: printLog }),
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
