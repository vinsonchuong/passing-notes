/* @flow */
import type { NodeRequestHandler } from 'passing-notes/lib/node'
import type { Responder } from 'passing-notes/lib/http'
import getStream from 'get-stream'

export default function(computeResponse: Responder): NodeRequestHandler {
  return async (nodeRequest, nodeResponse) => {
    const request = {
      method: nodeRequest.method,
      url: nodeRequest.url,
      headers: nodeRequest.headers,
      body: await getStream(nodeRequest)
    }

    const response = await computeResponse(request)

    nodeResponse.writeHead(response.status, response.headers)

    if (typeof response.body === 'string' || response.body instanceof Buffer) {
      nodeResponse.end(response.body)
    } else {
      response.body.pipe(nodeResponse)
    }
  }
}
