/* @flow */
import { parse as parseUrl } from 'url'
import { respondToRequests } from 'passing-notes'

const things = []

export default respondToRequests(next => async request => {
  const parsedUrl = parseUrl(request.url)

  if (request.method === 'GET' && parsedUrl.path === '/things') {
    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ things })
    }
  }

  if (
    request.method === 'POST' &&
    parsedUrl.path === '/things' &&
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
