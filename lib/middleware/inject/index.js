/* @flow */
import type { Middleware } from 'passing-notes/lib/middleware'

export default function<
  Dependencies,
  Middlewares: Array<(Dependencies) => Middleware>
>(
  dependencies: Dependencies,
  middlewares: Middlewares
): $TupleMap<Middlewares, <M>((Dependencies) => M) => M> {
  return middlewares.map(middleware => middleware(dependencies))
}
