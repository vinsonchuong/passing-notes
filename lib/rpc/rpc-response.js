/* @flow */
import type { Json } from 'passing-notes/lib/rpc'

export type RpcResponse = { result: Json } | { error: Json }
