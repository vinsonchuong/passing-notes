/* @flow */
import type { Responder } from 'passing-notes/src/http'
import { promisify } from 'util'
import * as zlib from 'zlib'
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
      Buffer.byteLength(response.body) < 1000 ||
      !compressible(response.headers['content-type']) ||
      negotiator.encoding(['gzip', 'identity']) !== 'gzip'
    ) {
      return response
    }

    return {
      ...response,
      headers: {
        ...response.headers,
        'content-encoding': 'gzip'
      },
      body: await gzip(response.body)
    }
  }
}
