import typeIs from 'type-is'
import getStream from 'get-stream'

const textMediaTypes = [
  'text/*',
  'application/json',
  '*/*+json',
  '*/*+text',
  '*/*+xml'
]

export function parseHttp1Body(requestOrResponse) {
  if (!typeIs.hasBody(requestOrResponse)) {
    return ''
  }

  if (typeIs(requestOrResponse, textMediaTypes)) {
    return getStream(requestOrResponse)
  }

  return getStream.buffer(requestOrResponse)
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
