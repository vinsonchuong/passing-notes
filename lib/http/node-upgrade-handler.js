/* @flow */
import type { IncomingMessage } from 'http'
import type { Socket } from 'net'

export type NodeUpgradeHandler = (
  request: IncomingMessage,
  socket: Socket,
  head: Buffer
) => void | Promise<void>
