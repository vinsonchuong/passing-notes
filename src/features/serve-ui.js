/* @flow */
// import type { IncomingMessage, ServerResponse } from 'http'
import Bundler from 'parcel-bundler'

export default function(entryPoint: string) {
  const bundler = new Bundler(entryPoint, { logLevel: 0 })
  return bundler.middleware()

  // return (request: IncomingMessage, response: ServerResponse): void => {
  //   response.end('Hello World!')
  // }
}
