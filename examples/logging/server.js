/* @flow */
import { respondToRequests } from 'passing-notes'
import log, { logRequestsAndResponses } from 'passing-notes/lib/log'

export default respondToRequests(
  logRequestsAndResponses({ log }),
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
