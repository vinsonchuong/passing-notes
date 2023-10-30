import {Buffer} from 'node:buffer'
import {ReadableStream} from 'node:stream/web'
import * as https from 'node:https'
import * as http from 'node:http'
import test from 'ava'
import makeCert from 'make-cert'
import getStream from 'get-stream'
import sendRequest from './index.js'

test('sending a simple GET request', async (t) => {
  const response = await sendRequest({
    method: 'GET',
    url: 'http://example.com',
    headers: {},
  })

  t.is(response.status, 200)
  t.is(response.headers['content-type'], 'text/html; charset=UTF-8')
  t.true(response.body.includes('Example Domain'))
})

test('sending headers and a body', async (t) => {
  const response = await sendRequest({
    method: 'POST',
    url: 'https://httpbin.org/post',
    headers: {
      Name: 'value',
    },
    body: 'Some Text',
  })

  const info = JSON.parse(response.body)
  t.is(info.headers.Name, 'value')
  t.is(info.data, 'Some Text')
})

test('omitting headers', async (t) => {
  const response = await sendRequest({
    method: 'GET',
    url: 'http://example.com',
  })

  t.is(response.status, 200)
})

test('making a HTTPS request to localhost', async (t) => {
  const server = https.createServer(
    makeCert('localhost'),
    (request, response) => {
      response.writeHead(200, {'Content-Type': 'text/plain'})
      response.end('Hello World!')
    },
  )

  await new Promise((resolve) => {
    server.listen(10_001, resolve)
  })

  t.teardown(() => {
    server.close()
  })

  const response = await sendRequest({
    method: 'GET',
    url: 'https://localhost:10001',
    headers: {},
  })
  t.is(response.body, 'Hello World!')
})

test('parsing a binary body into a Buffer', async (t) => {
  const response = await sendRequest({
    method: 'GET',
    url: 'http://dummyimage.com/450x250/f00/fff',
    headers: {},
  })

  t.true(response.body instanceof Buffer)
})

test('supporting streaming server-sent events', async (t) => {
  const server = new http.Server()
  server.on('request', (request, response) => {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
    })
    response.end(
      [
        ': comment\n',
        '\n',
        'data: some text\n',
        '\n',
        'data: multiple\n',
        'data: lines\n',
        '\n',
        'event: foo\n',
        'data: bar\n',
        '\n',
      ].join(''),
    )
  })

  await new Promise((resolve) => {
    server.listen(12_000)
    server.once('listening', resolve)
  })

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:12000',
    headers: {},
  })

  t.true(response.body instanceof ReadableStream)
  t.is(
    await getStream(response.body),
    [
      ': comment\n',
      '\n',
      'data: some text\n',
      '\n',
      'data: multiple\n',
      'data: lines\n',
      '\n',
      'event: foo\n',
      'data: bar\n',
      '\n',
    ].join(''),
  )
})
