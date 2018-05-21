/* @flow */
import test from 'ava'
import { promisify } from 'util'
import * as zlib from 'zlib'
import { repeat } from 'lodash'
import compressBody from './'

const gunzip = promisify(zlib.gunzip)

const longString = repeat('Hello', 201)
const shortString = repeat('Hello', 199)

test('compressing the body with gzip', async t => {
  const respond = compressBody(request => {
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
    }
  })

  t.is(response.headers['content-encoding'], 'gzip')
  t.is((await gunzip(response.body)).toString(), longString)
})

test('not compressing a response body with less than 1000 bytes', async t => {
  const respond = compressBody(request => ({
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
    }
  })

  t.not(response.headers['content-encoding'], 'gzip')
  t.is(response.body, shortString)
})

test('not compressing a response body that is not compressible text', async t => {
  const respond = compressBody(request => ({
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
    }
  })

  t.not(response.headers['content-encoding'], 'gzip')
  t.is(response.body, longString)
})

test('not compressing a response body when the client does not support gzip', async t => {
  const respond = compressBody(request => ({
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
    }
  })

  t.not(response.headers['content-encoding'], 'gzip')
  t.is(response.body, longString)
})
