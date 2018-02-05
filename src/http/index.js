/* eslint-disable flowtype/no-weak-types */
/* @flow */
import type { IncomingMessage, ServerResponse } from 'http'

export type NodeRequestHandler = (
  request: IncomingMessage,
  response: ServerResponse
) => void | Promise<void>

export type Request = {
  method: string,
  url: string,
  headers: { [string]: string }
}

export type Response = {
  status: number,
  headers: { [string]: string },
  body: any
}

export type Responder = Request => Response | Promise<Response>

export { default as getPort } from './get-port'
export { default as startServer } from './start-server'
export { default as stopServer } from './stop-server'

export { default as fetchText } from './fetch-text'

export { default as sendRequest } from './send-request'
export { default as respondToRequests } from './respond-to-requests'
