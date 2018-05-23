/* @flow */
import test from 'ava'
import { liftRequest } from 'passing-notes/lib/rpc'

test('lifting RPC to HTTP', async t => {
  const sendRpc = liftRequest(request => {
    t.deepEqual(request, {
      method: 'POST',
      url: '/rpc',
      headers: {},
      body: {
        action: 'add',
        params: [1, 2]
      }
    })

    return {
      status: 200,
      headers: {},
      body: { result: 3 }
    }
  })

  t.deepEqual(await sendRpc({ action: 'add', params: [1, 2] }), { result: 3 })
})
