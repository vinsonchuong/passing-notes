/* @flow */
import test from 'ava'
import * as path from 'path'
import { serveStaticFiles } from 'passing-notes/lib/static-files'

const fixtureDirectory = path.resolve(__dirname, 'fixtures')

test('serving static assets', async t => {
  const respond = serveStaticFiles(fixtureDirectory)(() => {
    throw new Error('Unexpected Request')
  })

  const htmlResponse = await respond({
    method: 'GET',
    url: '/index.html',
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

  const scriptResponse = await respond({
    method: 'GET',
    url: '/script.js',
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
})

test('serving index.html when requesting a directory', async t => {
  const respond = serveStaticFiles(fixtureDirectory)(() => {
    throw new Error('Unexpected Request')
  })

  const response = await respond({
    method: 'GET',
    url: '/',
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
})

test('returning 304 when the client has a fresh copy of the asset', async t => {
  const respond = serveStaticFiles(fixtureDirectory)(() => {
    throw new Error('Unexpected Request')
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
      'if-modified-since': addMinutes(
        fullResponse.headers['last-modified'],
        1
      ).toUTCString()
    },
    body: ''
  })
  t.is(cachedResponse.status, 304)
  t.falsy(cachedResponse.body)
})

test('falling through if a file cannot be found', async t => {
  const respond = serveStaticFiles(fixtureDirectory)(async () => ({
    status: 404,
    headers: {},
    body: ''
  }))

  const fullResponse = await respond({
    method: 'GET',
    url: '/does-not-exist',
    headers: {},
    body: ''
  })
  t.is(fullResponse.status, 404)
})

function addMinutes(date, minutes) {
  return new Date(new Date(date).valueOf() + minutes * 60 * 1000)
}
