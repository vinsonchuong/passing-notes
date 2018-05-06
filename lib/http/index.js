/* eslint-disable flowtype/no-weak-types */
/* @flow */
import type { IncomingMessage, ServerResponse } from 'http'

export type NodeRequestHandler = (
  request: IncomingMessage,
  response: ServerResponse
) => void | Promise<void>

export type Headers = { [string]: string }

export type Request = {
  method: string,
  url: string,
  headers: Headers,
  body?: any
}

export type Response = {
  status: number,
  headers: Headers,
  body: any
}

export type Responder = Request => Response | Promise<Response>

export { default as getPort } from './get-port'
export { default as startServer } from './start-server'
export { default as stopServer } from './stop-server'

export { default as liftResponder } from './lift-responder'
export { default as liftRequest } from './lift-request'
