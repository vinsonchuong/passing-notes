/* @flow */
import type { IncomingMessage, ServerResponse } from 'http'

export type Feature = (
  request: IncomingMessage,
  response: ServerResponse,
  next: ?() => void
) => void | Promise<void>

export { default } from 'passing-notes/src/pass-notes'
export { default as serveUi } from 'passing-notes/src/features/serve-ui'
