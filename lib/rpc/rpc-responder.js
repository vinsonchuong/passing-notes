/* @flow */
import type { RpcRequest, RpcResponse } from 'passing-notes/lib/rpc'

export type RpcResponder = RpcRequest => RpcResponse | Promise<RpcResponse>
