import * as http2 from 'http2'
import pEvent from 'p-event'
import {parseHttp2Body} from '../parse-body.js'

const {HTTP2_HEADER_PATH, HTTP2_HEADER_STATUS} = http2.constants

export default async function (url) {
  const options = {}
  const parsedUrl = new URL(url)
  if (parsedUrl.protocol === 'https:' && parsedUrl.hostname === 'localhost') {
    options.rejectUnauthorized = false
  }

  const client = http2.connect(url, options)
  await pEvent(client, 'connect')

  return {
    async sendRequest(request) {
      const nodeResponse = client.request({
        [HTTP2_HEADER_PATH]: request.url,
        ...request.headers
      })

      const nodeHeaders = await pEvent(nodeResponse, 'response')
      const body = await parseHttp2Body(nodeHeaders, nodeResponse)

      const {[HTTP2_HEADER_STATUS]: status, ...headers} = nodeHeaders

      return {status, headers, body}
    },

    async close() {
      client.close()
      await pEvent(client, 'close')
    }
  }
}
