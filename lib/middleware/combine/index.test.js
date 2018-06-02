/* @flow */
import test from 'ava'
import combine from './'

test('combining middleware', async t => {
  const one = next => async request => {
    const response = await next({
      ...request,
      body: request.body.concat('one')
    })
    return {
      ...response,
      body: response.body.concat('one')
    }
  }

  const two = next => async request => {
    const response = await next({
      ...request,
      body: request.body.concat('two')
    })
    return {
      ...response,
      body: response.body.concat('two')
    }
  }

  const processRequest = combine(one, two)(request => {
    t.deepEqual(request, {
      method: 'POST',
      url: '/',
      headers: {},
      body: ['two', 'one']
    })

    return {
      status: 200,
      headers: {},
      body: []
    }
  })

  t.deepEqual(
    await processRequest({ method: 'POST', url: '/', headers: {}, body: [] }),
    {
      status: 200,
      headers: {},
      body: ['one', 'two']
    }
  )
})
