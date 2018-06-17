/* @flow */
import test from 'ava'
import { inject, combine } from 'passing-notes/lib/middleware'

test('injecting dependencies into middleware', async t => {
  const middleware = combine(
    inject({ num: 42 }, [
      ({ num }) => next => async request => {
        const response = await next(request)
        return {
          ...response,
          headers: {
            ...response.headers,
            one: String(num)
          }
        }
      },

      ({ num }) => next => async request => {
        const response = await next(request)
        return {
          ...response,
          headers: {
            ...response.headers,
            two: String(num)
          }
        }
      }
    ])
  )

  const makeRequest = middleware(async request => ({
    status: 200,
    headers: {},
    body: ''
  }))

  t.deepEqual(
    await makeRequest({ method: 'GET', url: '', headers: {}, body: '' }),
    {
      status: 200,
      headers: {
        one: '42',
        two: '42'
      },
      body: ''
    }
  )
})
