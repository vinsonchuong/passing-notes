/* @flow */
import type { Middleware } from 'passing-notes/lib/middleware'
import { flowRight } from 'lodash'

export default function(...middlewares: Array<Middleware>): Middleware {
  return flowRight(...middlewares)
}
