/* @flow */
import type { Responder, NodeRequestHandler } from 'passing-notes/lib/http'
import { omit } from 'lodash'
import getStream from 'get-stream'

export default function(computeResponse: Responder): NodeRequestHandler {
  return async (nodeRequest, nodeResponse) => {
    const request = {
      method: nodeRequest.method,
      url: nodeRequest.url,
      headers: omit(nodeRequest.headers, 'connection'),
      body: (await getStream(nodeRequest)) || null
    }

    const response = await computeResponse(request)

    nodeResponse.writeHead(response.status, response.headers)
    nodeResponse.end(response.body)
  }
}
