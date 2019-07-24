/* @flow */
import type {
  HttpRequestHandler as NodeHttpRequestHandler,
  HttpUpgradeHandler as NodeHttpUpgradeHandler
} from 'passing-notes/lib/node'
import { Server } from 'http'

export default async function(
  port: number,
  handleRequest: NodeHttpRequestHandler,
  handleUpgrade: ?NodeHttpUpgradeHandler
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
