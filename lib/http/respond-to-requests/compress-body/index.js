/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import { promisify } from 'util'
import * as zlib from 'zlib'
import * as iltorb from 'iltorb'
import { omit } from 'lodash'
import compressible from 'compressible'
import Negotiator from 'negotiator'
import isStream from 'is-stream'

const gzip = promisify(zlib.gzip)

export default function(next: Responder): Responder {
  return async request => {
    const response = await next({
      ...request,
      headers: omit(request.headers, 'accept-encoding')
    })
    const negotiator = new Negotiator(request)

    if (
      (!isStream(response.body) && Buffer.byteLength(response.body) < 1000) ||
      !compressible(response.headers['content-type'])
    ) {
      return response
    }

    switch (negotiator.encoding(['br', 'gzip', 'identity'])) {
      case 'br':
        return {
          ...response,
          headers: {
            ...response.headers,
            'content-encoding': 'br'
          },
          body: isStream(response.body)
            ? response.body.pipe(iltorb.compressStream())
            : await iltorb.compress(ensureBuffer(response.body))
        }
      case 'gzip':
        return {
          ...response,
          headers: {
            ...response.headers,
            'content-encoding': 'gzip'
          },
          body: isStream(response.body)
            ? response.body.pipe(zlib.createGzip())
            : await gzip(response.body)
        }
      default:
        return response
    }
  }
}

function ensureBuffer(stringOrBuffer) {
  if (Buffer.isBuffer(stringOrBuffer)) {
    return stringOrBuffer
  }

  return Buffer.from(stringOrBuffer)
}
