/* @flow */
import test from 'ava'
import { promisify } from 'util'
import * as zlib from 'zlib'
import * as iltorb from 'iltorb'
import intoStream from 'into-stream'
import getStream from 'get-stream'
import { repeat } from 'lodash'
import { compressBody } from 'passing-notes/lib/http/respond-to-requests'

const gunzip = promisify(zlib.gunzip)

const longString = repeat('Hello', 201)
const shortString = repeat('Hello', 199)

test('compressing the body with brotli', async t => {
  const respond = compressBody(async request => {
    t.falsy(request.headers['accept-encoding'])

    return {
      status: 200,
      headers: {
        'content-type': 'text/plain'
      },
      body: longString
    }
  })

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {
      'accept-encoding': 'br, gzip'
    },
    body: ''
  })

  t.is(response.headers['content-encoding'], 'br')
  if (typeof response.body === 'string') {
    t.fail()
  } else if (response.body instanceof Buffer) {
    t.is((await iltorb.decompress(response.body)).toString(), longString)
  } else {
    t.fail()
  }
})

test('compressing a stream body with brotli', async t => {
  const respond = compressBody(async request => ({
    status: 200,
    headers: {
      'content-type': 'text/plain'
    },
    body: intoStream(longString)
  }))

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {
      'accept-encoding': 'br, gzip'
    },
    body: ''
  })

  t.is(response.headers['content-encoding'], 'br')

  if (typeof response.body === 'string') {
    t.fail()
  } else if (response.body instanceof Buffer) {
    t.fail()
  } else {
    t.is(
      await getStream(response.body.pipe(iltorb.decompressStream())),
      longString
    )
  }
})

test('compressing the body with gzip if the client does not accept gzip', async t => {
  const respond = compressBody(async request => {
    t.falsy(request.headers['accept-encoding'])

    return {
      status: 200,
      headers: {
        'content-type': 'text/plain'
      },
      body: longString
    }
  })

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {
      'accept-encoding': 'gzip'
    },
    body: ''
  })

  t.is(response.headers['content-encoding'], 'gzip')
  if (typeof response.body === 'string') {
    t.fail()
  } else if (response.body instanceof Buffer) {
    t.is((await gunzip(response.body)).toString(), longString)
  } else {
    t.fail()
  }
})

test('compressing a stream body with gzip', async t => {
  const respond = compressBody(async request => ({
    status: 200,
    headers: {
      'content-type': 'text/plain'
    },
    body: intoStream(longString)
  }))

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {
      'accept-encoding': 'gzip'
    },
    body: ''
  })

  t.is(response.headers['content-encoding'], 'gzip')
  if (typeof response.body === 'string') {
    t.fail()
  } else if (response.body instanceof Buffer) {
    t.fail()
  } else {
    t.is(await getStream(response.body.pipe(zlib.createGunzip())), longString)
  }
})

test('not compressing a response body with less than 1000 bytes', async t => {
  const respond = compressBody(async request => ({
    status: 200,
    headers: {
      'content-type': 'text/plain'
    },
    body: shortString
  }))

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {
      'accept-encoding': 'gzip'
    },
    body: ''
  })

  t.not(response.headers['content-encoding'], 'gzip')
  t.is(response.body, shortString)
})

test('not compressing a response body that is not compressible text', async t => {
  const respond = compressBody(async request => ({
    status: 200,
    headers: {
      'content-type': 'image/png'
    },
    body: longString
  }))

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {
      'accept-encoding': 'gzip'
    },
    body: ''
  })

  t.not(response.headers['content-encoding'], 'gzip')
  t.is(response.body, longString)
})

test('not compressing a response body when the client does not support gzip', async t => {
  const respond = compressBody(async request => ({
    status: 200,
    headers: {
      'content-type': 'text/plain'
    },
    body: longString
  }))

  const response = await respond({
    method: 'GET',
    url: '/',
    headers: {
      'accept-encoding': 'identity'
    },
    body: ''
  })

  t.not(response.headers['content-encoding'], 'gzip')
  t.is(response.body, longString)
})
