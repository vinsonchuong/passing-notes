/* @flow */
import test from 'ava'
import { serveRpc } from 'passing-notes/lib/rpc'

test('serving RPC requests', async t => {
  const respond = serveRpc({
    add(x, y) {
      if (typeof x !== 'number' || typeof y !== 'number')
        throw new Error('Invalid Inputs')

      return x + y
    },

    subtract(x, y) {
      if (typeof x !== 'number' || typeof y !== 'number')
        throw new Error('Invalid Inputs')

      return x - y
    },

    async sideEffect() {
      await Promise.resolve()
      return 42
    }
  })(request => {
    throw new Error('Unexpected Request')
  })

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        action: 'add',
        params: [3, 4]
      })
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        result: 7
      })
    }
  )

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        action: 'subtract',
        params: [11, 8]
      })
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        result: 3
      })
    }
  )

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        action: 'sideEffect',
        params: []
      })
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        result: 42
      })
    }
  )
})

test('only serving RPC requests at POST /rpc', async t => {
  const respond = serveRpc({
    add(x, y) {
      if (typeof x !== 'number' || typeof y !== 'number')
        throw new Error('Invalid Inputs')

      return x + y
    }
  })(async request => ({ status: 200, headers: {}, body: 'Ignored' }))

  t.deepEqual(
    await respond({ method: 'GET', url: '/rpc', headers: {}, body: '' }),
    {
      status: 200,
      headers: {},
      body: 'Ignored'
    }
  )

  t.deepEqual(
    await respond({ method: 'POST', url: '/path', headers: {}, body: '' }),
    {
      status: 200,
      headers: {},
      body: 'Ignored'
    }
  )
})

test('being robust against invalid request bodies', async t => {
  const respond = serveRpc({
    add(x, y) {
      if (typeof x !== 'number' || typeof y !== 'number')
        throw new Error('Invalid Inputs')

      return x + y
    }
  })(request => {
    throw new Error('Unexpected Request')
  })

  t.deepEqual(
    await respond({ method: 'POST', url: '/rpc', headers: {}, body: '' }),
    {
      status: 400,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ error: 'Missing HTTP Request Body' })
    }
  )

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {
        'content-type': 'image/png'
      },
      body: Buffer.from('')
    }),
    {
      status: 400,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ error: 'HTTP Request Body is not JSON' })
    }
  )

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {
        'content-type': 'text/plain'
      },
      body: 'Not JSON'
    }),
    {
      status: 400,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ error: 'HTTP Request Body is not JSON' })
    }
  )

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        action: 'add'
      })
    }),
    {
      status: 400,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ error: 'Missing RPC Params' })
    }
  )

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        params: []
      })
    }),
    {
      status: 400,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ error: 'Missing RPC Action' })
    }
  )
})

test('validating action name and param arity', async t => {
  const respond = serveRpc({
    add(x, y) {
      if (typeof x !== 'number' || typeof y !== 'number')
        throw new Error('Invalid Inputs')

      return x + y
    }
  })(request => {
    throw new Error('Unexpected Request')
  })

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        action: 'invalid',
        params: [1, 2]
      })
    }),
    {
      status: 422,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ error: 'Unknown Action' })
    }
  )

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        action: 'add',
        params: [1]
      })
    }),
    {
      status: 422,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ error: 'Incorrect Number of Parameters' })
    }
  )
})

test('handling runtime exceptions', async t => {
  const respond = serveRpc({
    add(x, y) {
      throw new Error('Runtime Error')
    }
  })(request => {
    throw new Error('Unexpected Request')
  })

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        action: 'add',
        params: [1, 2]
      })
    }),
    {
      status: 500,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ error: 'Runtime Error' })
    }
  )
})
