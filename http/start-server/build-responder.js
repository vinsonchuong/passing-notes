import * as http2 from 'http2'
import omit from 'lodash/omit.js'
import {parseHttp1Body} from '../parse-body.js'

const {
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_SCHEME,
  HTTP2_HEADER_AUTHORITY,
  HTTP2_HEADER_PATH
} = http2.constants

export default function (computeResponse) {
  return async (nodeRequest, nodeResponse) => {
    const request = {
      version: nodeRequest.httpVersion,
      method: nodeRequest.method,
      url: nodeRequest.url,
      headers: omit(nodeRequest.headers, [
        HTTP2_HEADER_METHOD,
        HTTP2_HEADER_SCHEME,
        HTTP2_HEADER_AUTHORITY,
        HTTP2_HEADER_PATH
      ]),
      body: await parseHttp1Body(nodeRequest)
    }

    const response = await computeResponse(request)

    nodeResponse.writeHead(response.status, response.headers)
    nodeResponse.end(response.body)

    const pushes = [...(response.push || [])]
    while (pushes.length > 0) {
      const pushRequest = pushes.shift()
      nodeResponse.createPushResponse(
        {
          [HTTP2_HEADER_METHOD]: pushRequest.method,
          [HTTP2_HEADER_PATH]: pushRequest.url,
          ...pushRequest.headers
        },
        async (error, nodePushResponse) => {
          const pushResponse = await computeResponse({
            ...pushRequest,
            version: request.version
          })
          pushes.push(...(pushResponse.push || []))
          nodePushResponse.writeHead(pushResponse.status, pushResponse.headers)
          nodePushResponse.end(pushResponse.body)
        }
      )
    }
  }
}
