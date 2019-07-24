/* @flow */
import type {
  NodeRequestHandler,
  NodeUpgradeHandler
} from 'passing-notes/lib/node'
import { Server } from 'http'

export default async function(
  port: number,
  handleRequest: NodeRequestHandler,
  handleUpgrade: ?NodeUpgradeHandler
): Promise<Server> {
  const server = new Server()
  server.on('request', handleRequest)
  if (handleUpgrade) {
    server.on('upgrade', handleUpgrade)
  }
  server.listen(port)
  await new Promise(resolve => {
    server.on('listening', resolve)
  })
  return server
}
