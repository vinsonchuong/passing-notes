/* @flow */
import type { IncomingMessage, ServerResponse } from 'http'
import { Server } from 'http'

type Respond = (
  request: IncomingMessage,
  response: ServerResponse
) => void | Promise<void>

export default async function(port: number, respond: Respond): Promise<Server> {
  const server = new Server()
  server.on('request', respond)
  server.listen(port)
  await new Promise(resolve => {
    server.on('listening', resolve)
  })
  return server
}
