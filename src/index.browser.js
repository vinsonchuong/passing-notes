/* @flow */
import fetch from 'cross-fetch'

export const api = new Proxy(
  {},
  {
    get: (_, procedure) => async (...parameters) => {
      const response = await fetch('/rpc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          procedure,
          parameters
        })
      })
      const body = await response.json()
      return body.result
    }
  }
)
