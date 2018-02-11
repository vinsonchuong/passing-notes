/* @flow */
import type { Request, Response } from 'passing-notes/src/http'
import contentType from 'content-type'
import fetch from 'cross-fetch'
import { flow, omit } from 'lodash'

const liftRequest: Request => Promise<Response> = flow([
  parseHeaders,
  parseResponse
])(sendRequest)
export default liftRequest

async function sendRequest(request) {
  const fetchResponse = await fetch(request.url, {
    method: request.method,
    headers: {
      ...request.headers,
      'user-agent':
        'passing-notes/1.0 (+https://github.com/splayd/passing-notes)'
    },
    body: request.body
  })

  return {
    status: fetchResponse.status,
    headers: fetchResponse.headers,
    body: fetchResponse
  }
}

function parseHeaders(next) {
  return async request => {
    const response = await next(request)

    const headers = {}
    response.headers.forEach((value, key) => {
      if (!headers[key]) {
        headers[key] = value
      } else if (Array.isArray(headers[key])) {
        headers[key].push(value)
      } else {
        headers[key] = [headers[key], value]
      }
    })

    return { ...response, headers }
  }
}

function parseResponse(next) {
  return async request => {
    const response = await next(request)
    const { type } = contentType.parse(response.headers['content-type'])

    let body
    if (type === 'application/json') {
      body = await response.body.json()
    } else if (type.includes('text') || type.includes('xml')) {
      body = await response.body.text()
    } else {
      body = await response.body.blob()
    }

    return {
      ...response,
      headers: omit(response.headers, 'content-type'),
      body
    }
  }
}
