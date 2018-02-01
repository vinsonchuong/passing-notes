/* eslint-disable flowtype/no-weak-types */
/* @flow */
import fetch from 'cross-fetch'

type Request = {
  method: 'GET',
  url: string
}

type Response = {
  status: number,
  headers: { [string]: string },
  body: any
}

export default async function({ url, ...params }: Request): Promise<Response> {
  const response = await fetch(url, params)
  return {
    status: response.status,
    headers: parseHeaders(response.headers),
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
