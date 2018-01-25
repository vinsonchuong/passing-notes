/* @flow */
import type { IncomingMessage, ServerResponse } from 'http'
import Bundler from 'parcel-bundler'

type Respond = (request: IncomingMessage, response: ServerResponse) => void

export default function(entryPoint: string): Respond {
  const bundler = new Bundler(entryPoint)
  return bundler.middleware()
}
