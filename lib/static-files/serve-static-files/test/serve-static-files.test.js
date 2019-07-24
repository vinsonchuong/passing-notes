/* @flow */
import test from 'ava'
import * as path from 'path'
import { serveStaticFiles } from 'passing-notes/lib/static-files'
import { startServer, stopServer } from 'passing-notes/lib/node'
import { sendRequest, respondToRequests } from 'passing-notes/lib/http'

const fixtureDirectory = path.resolve(__dirname, 'fixtures')

test('serving static assets', async t => {
  const server = await startServer(
    10070,
    respondToRequests(serveStaticFiles(fixtureDirectory))
  )

  const htmlResponse = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10070/index.html',
    headers: {},
    body: ''
  })
  t.is(htmlResponse.status, 200)
  t.is(htmlResponse.headers['content-type'], 'text/html; charset=utf-8')
  if (typeof htmlResponse.body === 'string') {
    t.regex(htmlResponse.body, /div.*Hello World/)
  } else if (htmlResponse.body instanceof Buffer) {
    t.fail()
  } else {
    t.fail()
  }

  const scriptResponse = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10070/script.js',
    headers: {},
    body: ''
  })
  t.is(scriptResponse.status, 200)
  t.is(
    scriptResponse.headers['content-type'],
    'application/javascript; charset=utf-8'
  )
  if (typeof scriptResponse.body === 'string') {
    t.regex(scriptResponse.body, /console.*Hello World/)
  } else if (htmlResponse.body instanceof Buffer) {
    t.fail()
  } else {
    t.fail()
  }

  await stopServer(server)
})

test('serving index.html when requesting a directory', async t => {
  const server = await startServer(
    10071,
    respondToRequests(serveStaticFiles(fixtureDirectory))
  )

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10071/',
    headers: {},
    body: ''
  })
  t.is(response.status, 200)
  t.is(response.headers['content-type'], 'text/html; charset=utf-8')
  if (typeof response.body === 'string') {
    t.regex(response.body, /div.*Hello World/)
  } else if (response.body instanceof Buffer) {
    t.fail()
  } else {
    t.fail()
  }

  await stopServer(server)
})

test('returning 304 when the client has a fresh copy of the asset', async t => {
  const respond = serveStaticFiles(fixtureDirectory)(async () => {
    throw new Error('Unexpected delegation')
  })

  const fullResponse = await respond({
    method: 'GET',
    url: '/',
    headers: {},
    body: ''
  })
  t.is(fullResponse.status, 200)

  const cachedResponse = await respond({
    method: 'GET',
    url: '/',
    headers: {
      'if-modified-since': new Date('2020-01-01').toUTCString()
    },
    body: ''
  })
  t.is(cachedResponse.status, 304)
  t.falsy(cachedResponse.body)
})

test('falling through if a file cannot be found', async t => {
  const server = await startServer(
    10073,
    respondToRequests(serveStaticFiles(fixtureDirectory))
  )

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10073/does-not-exist',
    headers: {},
    body: ''
  })
  t.is(response.status, 404)

  await stopServer(server)
})
