/* @flow */
import type { Json } from './json'

export type Action = (...Array<Json>) => Json | Promise<Json>
