/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import type { RpcResponder } from 'passing-notes/lib/rpc'

export default function(next: Responder): RpcResponder {
  return async rpcRequest => {
    const response = await next({
      method: 'POST',
      url: '/rpc',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(rpcRequest)
    })

    return response.body
  }
}
