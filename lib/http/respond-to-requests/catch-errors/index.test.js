/* @flow */
import test from 'ava'
import { catchErrors } from 'passing-notes/lib/http/respond-to-requests'

test('catching exceptions', async t => {
  const respond = catchErrors(() => {
    throw new Error('Uncaught')
  })

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {},
    body: ''
  })

  t.deepEqual(response, {
    status: 500,
    headers: {
      'content-length': '0'
    },
    body: ''
  })
})
