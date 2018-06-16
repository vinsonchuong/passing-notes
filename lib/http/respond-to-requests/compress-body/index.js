/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import { promisify } from 'util'
import * as zlib from 'zlib'
import * as iltorb from 'iltorb'
import { omit } from 'lodash'
import compressible from 'compressible'
import Negotiator from 'negotiator'

const gzip = promisify(zlib.gzip)

export default function(next: Responder): Responder {
  return async request => {
    const response = await next({
      ...request,
      headers: omit(request.headers, 'accept-encoding')
    })
    const negotiator = new Negotiator(request)

    if (
      ((typeof response.body === 'string' || response.body instanceof Buffer) &&
        Buffer.byteLength(response.body) < 1000) ||
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
          body:
            typeof response.body === 'string' || response.body instanceof Buffer
              ? await iltorb.compress(ensureBuffer(response.body))
              : response.body.pipe(iltorb.compressStream())
        }
      case 'gzip':
        return {
          ...response,
          headers: {
            ...response.headers,
            'content-encoding': 'gzip'
          },
          body:
            typeof response.body === 'string' || response.body instanceof Buffer
              ? await gzip(response.body)
              : response.body.pipe(zlib.createGzip())
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
