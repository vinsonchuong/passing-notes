/* @flow */
import type { Json } from 'passing-notes/lib/rpc'

export type RpcRequest = {
  action: string,
  params: Array<Json>
}
