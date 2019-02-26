/* @flow */
import parseUrl from 'url-parse'
import { respondToRequests } from 'passing-notes'

const things = []

export default respondToRequests(next => async request => {
  const parsedUrl = parseUrl(request.url)

  if (request.method === 'GET' && parsedUrl.pathname === '/things') {
    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ things })
    }
  }

  if (
    request.method === 'POST' &&
    parsedUrl.pathname === '/things' &&
    typeof request.body === 'string'
  ) {
    const newThing = JSON.parse(request.body)
    things.push(newThing)

    return {
      status: 201,
      headers: {},
      body: ''
    }
  }

  return next(request)
})
