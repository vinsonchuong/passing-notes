/* @flow */
import test from 'ava'
import * as path from 'path'
import { serveStatic } from 'passing-notes/lib/middleware'

const fixtureDirectory = path.resolve(__dirname, 'fixtures')

test('serving static assets', async t => {
  const respond = serveStatic(fixtureDirectory)(() => {
    throw new Error('Unexpected Request')
  })

  const htmlResponse = await respond({
    method: 'GET',
    url: '/index.html',
    headers: {},
    body: null
  })
  t.is(htmlResponse.status, 200)
  t.is(htmlResponse.headers['content-type'], 'text/html; charset=utf-8')
  t.regex(htmlResponse.body, /div.*Hello World/)

  const scriptResponse = await respond({
    method: 'GET',
    url: '/script.js',
    headers: {},
    body: null
  })
  t.is(scriptResponse.status, 200)
  t.is(
    scriptResponse.headers['content-type'],
    'application/javascript; charset=utf-8'
  )
  t.regex(scriptResponse.body, /console.*Hello World/)
})

test('serving index.html when requesting a directory', async t => {
  const respond = serveStatic(fixtureDirectory)(() => {
    throw new Error('Unexpected Request')
  })

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {},
    body: null
  })
  t.is(response.status, 200)
  t.is(response.headers['content-type'], 'text/html; charset=utf-8')
  t.regex(response.body, /div.*Hello World/)
})

test('providing a Last-Modified header', async t => {
  const respond = serveStatic(fixtureDirectory)(() => {
    throw new Error('Unexpected Request')
  })

  const fullResponse = await respond({
    method: 'GET',
    url: '/',
    headers: {},
    body: null
  })
  t.is(fullResponse.status, 200)
  t.is(fullResponse.headers['last-modified'], 'Fri, 08 Jun 2018 20:11:07 GMT')

  const cachedResponse = await respond({
    method: 'GET',
    url: '/',
    headers: {
      'if-modified-since': 'Fri, 08 Jun 2018 20:11:07 GMT'
    },
    body: null
  })
  t.is(cachedResponse.status, 304)
  t.is(cachedResponse.headers['last-modified'], 'Fri, 08 Jun 2018 20:11:07 GMT')
  t.falsy(cachedResponse.body)
})

test('falling through if a file cannot be found', async t => {
  const respond = serveStatic(fixtureDirectory)(() => ({
    status: 404,
    headers: {},
    body: null
  }))

  const fullResponse = await respond({
    method: 'GET',
    url: '/does-not-exist',
    headers: {},
    body: null
  })
  t.is(fullResponse.status, 404)
})
