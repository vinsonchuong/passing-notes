/* @flow */
import type { Responder, NodeRequestHandler } from 'passing-notes/lib/http'
import getStream from 'get-stream'
import isStream from 'is-stream'

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

    if (isStream(response.body)) {
      response.body.pipe(nodeResponse)
    } else {
      nodeResponse.end(response.body)
    }
  }
}
