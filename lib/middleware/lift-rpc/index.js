/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import type { Json } from '../serve-rpc/json'

type RpcRequest = {
  action: string,
  params: Array<Json>
}

type RpcResponse = { result: Json } | { error: Json }

type RpcResponder = RpcRequest => RpcResponse | Promise<RpcResponse>

export default function(next: Responder): RpcResponder {
  return async rpcRequest => {
    const response = await next({
      method: 'POST',
      url: '/rpc',
      headers: {},
      body: rpcRequest
    })

    return response.body
  }
}
