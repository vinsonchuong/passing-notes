/* @flow */
import test from 'ava'
import { liftRequest } from 'passing-notes/lib/rpc'

test('lifting RPC to HTTP', async t => {
  const sendRpc = liftRequest(async request => {
    t.deepEqual(request, {
      method: 'POST',
      url: '/rpc',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        action: 'add',
        params: [1, 2]
      })
    })

    return {
      status: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ result: 3 })
    }
  })

  t.deepEqual(await sendRpc({ action: 'add', params: [1, 2] }), { result: 3 })
})
