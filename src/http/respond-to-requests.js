/* @flow */
import type {
  Request,
  Response,
  NodeRequestHandler
} from 'passing-notes/src/http'
import { omit } from 'lodash'

const omittedHeaders = ['user-agent', 'accept', 'accept-encoding', 'connection']

export default function(
  computeResponse: Request => Response
): NodeRequestHandler {
  return (nodeRequest, nodeResponse) => {
    const request = {
      method: nodeRequest.method,
      url: nodeRequest.url,
      headers: omit(nodeRequest.headers, omittedHeaders)
    }

    const response = computeResponse(request)

    const body = JSON.stringify(response.body)
    nodeResponse.writeHead(response.status, {
      ...response.headers,
      'content-length': String(Buffer.byteLength(body)),
      'content-type': 'application/json'
    })
    nodeResponse.end(body)
  }
}
