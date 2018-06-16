/* @flow */
import test from 'ava'
import { startServer, stopServer } from 'passing-notes/lib/http'
import { lift } from 'passing-notes/lib/http/send-request'

test('fetching HTML', async t => {
  const response = await lift({
    method: 'GET',
    headers: {},
    url: 'http://example.com',
    body: ''
  })

  t.is(response.status, 200)
  t.is(response.headers['content-type'], 'text/html')

  if (typeof response.body === 'string') {
    t.regex(response.body, /Example Domain/)
  } else if (response.body instanceof Buffer) {
    t.fail()
  } else {
    t.fail()
  }
})

test('fetching JSON', async t => {
  const response = await lift({
    method: 'GET',
    headers: {},
    url: 'http://httpbin.org/ip',
    body: ''
  })

  if (typeof response.body === 'string') {
    t.true('origin' in JSON.parse(response.body))
  } else if (response.body instanceof Buffer) {
    t.fail()
  } else {
    t.fail()
  }
})

test('fetching JavaScript', async t => {
  const server = await startServer(10021, (request, response) => {
    response.setHeader('content-type', 'application/javascript')
    response.end('console.log("Hello World!")')
  })

  const response = await lift({
    method: 'GET',
    headers: {},
    url: 'http://localhost:10021',
    body: ''
  })

  t.true(typeof response.body === 'string')

  await stopServer(server)
})

test('fetching an image', async t => {
  const response = await lift({
    method: 'GET',
    headers: {},
    url: 'http://via.placeholder.com/100x100',
    body: ''
  })

  if (typeof response.body === 'string') {
    t.fail()
  } else if (response.body instanceof Buffer) {
    t.fail()
  } else {
    t.pass()
  }
})

test('parsing duplicate response headers', async t => {
  const server = await startServer(10020, (request, response) => {
    response.setHeader('x-key', ['value1', 'value2'])
    response.end()
  })

  const response = await lift({
    method: 'GET',
    headers: {},
    url: 'http://localhost:10020',
    body: ''
  })

  t.is(response.headers['x-key'], 'value1, value2')

  await stopServer(server)
})

test('sending a POST request with a body', async t => {
  const response = await lift({
    method: 'POST',
    url: 'http://httpbin.org/post',
    headers: {},
    body: JSON.stringify({
      hello: 'world'
    })
  })

  t.is(response.status, 200)

  if (typeof response.body === 'string') {
    t.is(JSON.parse(response.body).data, '{"hello":"world"}')
  } else if (response.body instanceof Buffer) {
    t.fail()
  } else {
    t.fail()
  }
})

test('sending headers', async t => {
  const response = await lift({
    method: 'GET',
    url: 'http://httpbin.org/headers',
    headers: {
      'x-key': 'value'
    },
    body: ''
  })

  if (typeof response.body === 'string') {
    t.is(JSON.parse(response.body).headers['X-Key'], 'value')
  } else if (response.body instanceof Buffer) {
    t.fail()
  } else {
    t.fail()
  }
})
