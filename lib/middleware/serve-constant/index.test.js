/* @flow */
import test from 'ava'
import serveConstant from './'

test('serving a constant response', async t => {
  const respond = serveConstant({
    status: 404,
    headers: {},
    body: ''
  })(() => {
    throw new Error('Unexpected Request')
  })

  t.deepEqual(
    await respond({ method: 'GET', url: '/', headers: {}, body: '' }),
    { status: 404, headers: {}, body: '' }
  )
})
