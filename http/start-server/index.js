import {ServerResponse} from 'node:http'
import {createServer} from 'httpx-server'
import buildResponder from './build-responder.js'

export default async function ({port, ...options}, computeResponse) {
  const server = createServer(options)

  server.on('request', buildResponder(computeResponse))

  const writeUpgradeResponse = buildResponder(computeResponse, {
    endAfterBody: false,
  })
  server.on('upgrade', async (nodeRequest, socket, head) => {
    const nodeResponse = new ServerResponse(nodeRequest)
    nodeResponse.assignSocket(socket)
    const response = await writeUpgradeResponse(nodeRequest, nodeResponse)

    if (response.status === 101) {
      nodeResponse.flushHeaders()
      nodeResponse.detachSocket(socket)
      response.upgrade(socket, head)
    } else {
      nodeResponse.end()
    }
  })

  await new Promise((resolve, reject) => {
    server.listen(port, resolve)
    server.on('error', reject)
  })

  return server
}
