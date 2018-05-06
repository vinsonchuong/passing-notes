/* @flow */
import type { NodeRequestHandler } from 'passing-notes/lib/http'
import { Server } from 'http'

export default async function(
  port: number,
  handleRequest: NodeRequestHandler
): Promise<Server> {
  const server = new Server()
  server.on('request', handleRequest)
  server.listen(port)
  await new Promise(resolve => {
    server.on('listening', resolve)
  })
  return server
}
