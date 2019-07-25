/* @flow */
import type { HttpRequestHandler, HttpUpgradeHandler } from '../'
import { Server } from 'http'

export default async function(
  port: number,
  handleRequests: ?HttpRequestHandler,
  handleUpgrades: ?HttpUpgradeHandler
): Promise<Server> {
  const server = new Server()
  if (handleRequests) {
    server.on('request', handleRequests)
  }
  if (handleUpgrades) {
    server.on('upgrade', handleUpgrades)
  }
  server.listen(port)
  await new Promise(resolve => {
    server.on('listening', resolve)
  })
  return server
}
