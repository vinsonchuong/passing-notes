/* @flow */
import test from 'ava'
import combine from './'

test('combining middleware', async t => {
  const concatOne = makeConcatMiddleware('one')
  const concatTwo = makeConcatMiddleware('two')
  const lift = makeConcatMiddleware('lift')

  const processRequest = combine(lift, concatOne, concatTwo)(request => {
    t.deepEqual(request, {
      method: 'POST',
      url: '/',
      headers: {},
      body: ['lift', 'one', 'two']
    })

    return {
      status: 200,
      headers: {},
      body: []
    }
  })

  const response = await processRequest({
    method: 'POST',
    url: '/',
    headers: {},
    body: []
  })

  t.deepEqual(response, {
    status: 200,
    headers: {},
    body: ['two', 'one', 'lift']
  })
})

function makeConcatMiddleware(item) {
  return next => async request => {
    const response = await next({
      ...request,
      body: request.body.concat(item)
    })
    return {
      ...response,
      body: response.body.concat(item)
    }
  }
}
