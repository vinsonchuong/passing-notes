import {createServer} from 'httpx-server'
import buildResponder from './build-responder.js'
import buildUpgradeResponder from './build-upgrade-responder.js'

export default async function startServer({port, ...options}, computeResponse) {
  const server = createServer(options)

  server.on('request', buildResponder(computeResponse))
  server.on('upgrade', buildUpgradeResponder(computeResponse))

  await new Promise((resolve, reject) => {
    server.listen(port, resolve)
    server.on('error', reject)
  })

  return server
}
