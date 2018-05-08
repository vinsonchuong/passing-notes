/* @flow */
import type { IncomingMessage, ServerResponse } from 'http'

export type NodeRequestHandler = (
  request: IncomingMessage,
  response: ServerResponse
) => void | Promise<void>
