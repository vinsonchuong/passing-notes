/* @flow */
import sendRequest from './http/send-request'

export const api = new Proxy(
  {},
  {
    get: (_, procedure) => async (...parameters) => {
      const response = await sendRequest({
        method: 'POST',
        headers: {},
        url: '/rpc',
        body: { procedure, parameters }
      })
      return response.body.result
    }
  }
)
