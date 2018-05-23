/* @flow */
import test from 'ava'
import serveRpc from './'

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
      headers: {},
      body: {
        action: 'add',
        params: [3, 4]
      }
    }),
    {
      status: 200,
      headers: {},
      body: {
        result: 7
      }
    }
  )

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {},
      body: {
        action: 'subtract',
        params: [11, 8]
      }
    }),
    {
      status: 200,
      headers: {},
      body: {
        result: 3
      }
    }
  )

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {},
      body: {
        action: 'sideEffect',
        params: []
      }
    }),
    {
      status: 200,
      headers: {},
      body: {
        result: 42
      }
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
  })(request => ({ status: 200, headers: {}, body: 'Ignored' }))

  t.deepEqual(await respond({ method: 'GET', url: '/rpc', headers: {} }), {
    status: 200,
    headers: {},
    body: 'Ignored'
  })

  t.deepEqual(await respond({ method: 'POST', url: '/path', headers: {} }), {
    status: 200,
    headers: {},
    body: 'Ignored'
  })
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

  t.deepEqual(await respond({ method: 'POST', url: '/rpc', headers: {} }), {
    status: 400,
    headers: {},
    body: { error: 'Missing HTTP Request Body' }
  })

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {},
      body: {
        action: 'add'
      }
    }),
    { status: 400, headers: {}, body: { error: 'Missing RPC Params' } }
  )

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {},
      body: {
        params: []
      }
    }),
    { status: 400, headers: {}, body: { error: 'Missing RPC Action' } }
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
      headers: {},
      body: {
        action: 'invalid',
        params: [1, 2]
      }
    }),
    {
      status: 422,
      headers: {},
      body: { error: 'Unknown Action' }
    }
  )

  t.deepEqual(
    await respond({
      method: 'POST',
      url: '/rpc',
      headers: {},
      body: {
        action: 'add',
        params: [1]
      }
    }),
    {
      status: 422,
      headers: {},
      body: { error: 'Incorrect Number of Parameters' }
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
      headers: {},
      body: {
        action: 'add',
        params: [1, 2]
      }
    }),
    {
      status: 500,
      headers: {},
      body: { error: 'Runtime Error' }
    }
  )
})
