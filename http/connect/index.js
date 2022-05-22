import * as http2 from 'node:http2'
import {pEvent} from 'p-event'
import {fromQueue} from 'heliograph'
import {parseHttp2Body} from '../parse-body.js'

const {HTTP2_HEADER_METHOD, HTTP2_HEADER_PATH, HTTP2_HEADER_STATUS} =
  http2.constants

export default async function (url) {
  const options = {}
  const parsedUrl = new URL(url)
  if (parsedUrl.protocol === 'https:' && parsedUrl.hostname === 'localhost') {
    options.rejectUnauthorized = false
  }

  const client = http2.connect(url, options)
  await pEvent(client, 'connect')

  const pushedResponses = fromQueue()
  client.on('stream', async (stream, nodeRequestHeaders) => {
    const {
      [HTTP2_HEADER_METHOD]: method,
      [HTTP2_HEADER_PATH]: url,
      ...requestHeaders
    } = nodeRequestHeaders

    const nodeResponseHeaders = await pEvent(stream, 'push')
    const {[HTTP2_HEADER_STATUS]: status, ...responseHeaders} =
      nodeResponseHeaders
    const body = await parseHttp2Body(nodeResponseHeaders, stream)

    pushedResponses.push([
      {method, url, headers: requestHeaders},
      {status, headers: responseHeaders, body},
    ])
  })

  return {
    async sendRequest(request) {
      const nodeResponse = client.request({
        [HTTP2_HEADER_PATH]: request.url,
        ...request.headers,
      })

      const nodeHeaders = await pEvent(nodeResponse, 'response')
      const body = await parseHttp2Body(nodeHeaders, nodeResponse)

      const {[HTTP2_HEADER_STATUS]: status, ...headers} = nodeHeaders

      return {status, headers, body}
    },

    async close() {
      client.close()
      await pEvent(client, 'close')
    },

    pushedResponses,
  }
}
