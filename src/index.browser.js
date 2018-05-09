/* @flow */
import sendRequest from './send-request'

export const api = new Proxy(
  {},
  {
    get: (_, procedure) => async (...parameters) => {
      const response = await sendRequest({
        method: 'POST',
        url: '/rpc',
        body: { procedure, parameters }
      })
      return response.body.result
    }
  }
)
