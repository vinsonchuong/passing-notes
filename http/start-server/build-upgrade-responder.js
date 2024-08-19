import {Buffer} from 'node:buffer'
import {STATUS_CODES} from 'node:http'
import {parseHttp1Body} from '../parse-body.js'

export default function buildUpgradeResponder(computeResponse) {
  return async (nodeRequest, socket, head) => {
    const request = {
      version: nodeRequest.httpVersion,
      method: nodeRequest.method,
      url: nodeRequest.url,
      headers: nodeRequest.headers,
      body: await parseHttp1Body(nodeRequest),
    }

    const response = await computeResponse(request)

    socket.write(
      [
        `HTTP/1.1 ${response.status} ${STATUS_CODES[response.status]}`,
        ...Object.keys(response.headers ?? {}).map(
          (name) => `${name}: ${response.headers[name]}`,
        ),
        '\r\n',
      ].join('\r\n'),
    )

    if (
      (typeof response.body === 'string' && response.body) ||
      response.body instanceof Buffer
    ) {
      socket.write(response.body)
    } else if (response.pipe) {
      response.body.pipe(socket, {end: false})
      await new Promise((resolve) => {
        response.body.once('end', resolve)
      })
    }

    if (response.status === 101) {
      response.upgrade(socket, head)
    } else {
      socket.end()
    }
  }
}
