import {createServer} from 'httpx-server'
import buildResponder from './build-responder.js'

export default async function ({port, ...options}, computeResponse) {
  const server = createServer(options)

  server.on('request', buildResponder(computeResponse))

  await new Promise((resolve, reject) => {
    server.listen(port, resolve)
    server.on('error', reject)
  })

  return server
}
