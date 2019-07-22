/* @flow */
import test from 'ava'
import { combineMiddleware } from 'passing-notes/lib/middleware'

test('combining middleware', async t => {
  const combinedMiddleware = combineMiddleware([
    next => async request => {
      const response = await next({
        ...request,
        headers: {
          'added-value': 'one'
        }
      })

      return {
        ...response,
        headers: {
          'added-value': `${response.headers['added-value']}, one`
        }
      }
    },

    next => async request => {
      const response = await next({
        ...request,
        headers: {
          'added-value': `${request.headers['added-value']}, two`
        }
      })

      return {
        ...response,
        headers: {
          'added-value': 'two'
        }
      }
    }
  ])

  const sendRequest = combinedMiddleware(async request => {
    t.deepEqual(request, {
      method: 'GET',
      url: '/',
      headers: {
        'added-value': 'one, two'
      },
      body: 'Ping'
    })

    return {
      status: 200,
      headers: {},
      body: 'Pong'
    }
  })

  const response = await sendRequest({
    method: 'GET',
    url: '/',
    headers: {},
    body: 'Ping'
  })

  t.deepEqual(response, {
    status: 200,
    headers: {
      'added-value': 'two, one'
    },
    body: 'Pong'
  })
})
