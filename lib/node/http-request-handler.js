/* @flow */
import type { IncomingMessage, ServerResponse } from 'http'

export type HttpRequestHandler = (
  request: IncomingMessage,
  response: ServerResponse
) => void | Promise<void>
