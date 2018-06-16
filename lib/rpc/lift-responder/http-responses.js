/* @flow */
import type { Response } from 'passing-notes/lib/http'
import type { Json } from 'passing-notes/lib/rpc'

export function ok(result: Json): Response {
  return {
    status: 200,
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ result })
  }
}

export function badRequest(error: Json): Response {
  return {
    status: 400,
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ error })
  }
}

export function unprocessableEntity(error: Json): Response {
  return {
    status: 422,
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ error })
  }
}

export function internalServerError(error: Json): Response {
  return {
    status: 500,
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ error })
  }
}
