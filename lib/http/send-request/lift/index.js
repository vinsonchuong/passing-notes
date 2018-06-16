/* @flow */
import type { Request, Response } from 'passing-notes/lib/http'
import fetch from 'cross-fetch'
import contentType from 'content-type'

export default async function(request: Request): Promise<Response> {
  const fetchResponse = await fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body || null
  })

  const headers = {}
  fetchResponse.headers.forEach((value, key) => {
    if (headers[key]) {
      headers[key] = `${headers[key]}, ${value}`
    } else {
      headers[key] = value
    }
  })

  const { type } = contentType.parse(headers['content-type'] || 'text/plain')
  let body
  if (
    type.includes('text') ||
    type === 'application/javascript' ||
    type === 'application/json'
  ) {
    body = await fetchResponse.text()
  } else {
    body = await fetchResponse.blob()
  }

  return {
    status: fetchResponse.status,
    headers,
    body
  }
}
