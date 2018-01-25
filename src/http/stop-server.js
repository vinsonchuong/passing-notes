/* @flow */
import type { Server } from 'http'

export default async function(server: Server): Promise<void> {
  await new Promise(resolve => {
    server.close(resolve)
  })
}
