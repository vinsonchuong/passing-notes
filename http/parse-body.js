import {Readable} from 'node:stream'
import typeIs from 'type-is'
import getStream, {getStreamAsBuffer} from 'get-stream'

const textMediaTypes = [
  'text/*',
  'application/json',
  '*/*+json',
  '*/*+text',
  '*/*+xml',
]

export function parseHttp1Body(requestOrResponse) {
  if (!typeIs.hasBody(requestOrResponse)) {
    return ''
  }

  if (typeIs(requestOrResponse, ['text/event-stream'])) {
    return Readable.toWeb(requestOrResponse)
  }

  if (typeIs(requestOrResponse, textMediaTypes)) {
    return getStream(requestOrResponse)
  }

  return getStreamAsBuffer(requestOrResponse)
}

export function parseHttp2Body(nodeHeaders, nodeResponse) {
  if (nodeResponse.endAfterHeaders) {
    return ''
  }

  if (typeIs.is(nodeHeaders['content-type'], textMediaTypes)) {
    return getStream(nodeResponse)
  }

  return getStream.buffer(nodeResponse)
}
