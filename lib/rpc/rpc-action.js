/* @flow */
import type { Json } from 'passing-notes/lib/rpc'

export type RpcAction = (...Array<Json>) => Json | Promise<Json>
