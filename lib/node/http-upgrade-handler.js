/* @flow */
import type { IncomingMessage } from 'http'
import type { Socket } from 'net'

export type HttpUpgradeHandler = (
  request: IncomingMessage,
  socket: Socket,
  head: Buffer
) => void | Promise<void>
