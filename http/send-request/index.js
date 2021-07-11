import * as http from 'node:http'
import * as https from 'node:https'
import {parseHttp1Body} from '../parse-body.js'

export default function (request) {
  const url = new URL(request.url)
  const nodeSendRequest =
    url.protocol === 'https:' ? https.request : http.request

  return new Promise((resolve, reject) => {
    const nodeRequest = nodeSendRequest(
      url,
      {
        method: request.method,
        headers: request.headers,
        rejectUnauthorized: url.hostname !== 'localhost'
      },
      async (nodeResponse) => {
        resolve({
          status: nodeResponse.statusCode,
          headers: nodeResponse.headers,
          body: await parseHttp1Body(nodeResponse)
        })
      }
    )

    nodeRequest.on('error', (error) => {
      reject(error)
    })

    if (request.body?.pipe) {
      request.body.pipe(nodeRequest)
    } else {
      nodeRequest.end(request.body)
    }
  })
}
