/* @flow */
import test from 'ava'
import { catchErrors } from 'passing-notes/lib/middleware'

test('catching exceptions', async t => {
  const respond = catchErrors(() => {
    throw new Error('Uncaught')
  })

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {},
    body: null
  })

  t.deepEqual(response, {
    status: 500,
    headers: {
      'content-length': '0'
    },
    body: ''
  })
})
