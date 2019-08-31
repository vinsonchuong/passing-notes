/* @flow */
import type { IncomingMessage } from 'http'

export type HttpUpgradeHandler = (
  request: IncomingMessage,
  socket: net$Socket,
  head: Buffer
) => void | Promise<void>
