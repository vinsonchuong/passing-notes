/* @flow */
import type { Request, Response } from 'passing-notes/src/http'
import { omit } from 'lodash'
import fetch from 'cross-fetch'

const omittedHeaders = [
  'connection',
  'content-encoding',
  'content-length',
  'content-type',
  'date'
]

export default async function({ url, ...params }: Request): Promise<Response> {
  const response = await fetch(url, {
    ...params,
    headers: {
      ...params.headers,
      'User-Agent':
        'passing-notes/1.0 (+https://github.com/splayd/passing-notes)'
    }
  })
  return {
    status: response.status,
    headers: omit(parseHeaders(response.headers), omittedHeaders),
    body: await response.json()
  }
}

function parseHeaders(headers) {
  const plainObject = {}
  headers.forEach((value, key) => {
    if (!plainObject[key]) {
      plainObject[key] = value
    } else if (Array.isArray(plainObject[key])) {
      plainObject[key].push(value)
    } else {
      plainObject[key] = [plainObject[key], value]
    }
  })
  return plainObject
}
