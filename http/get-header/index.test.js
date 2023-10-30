import test from 'ava'
import getHeader from './index.js'

test('reading headers from a request or response', (t) => {
  t.is(getHeader({}, 'Content-Type'), null)
  t.is(getHeader({headers: {}}, 'Content-Type'), null)

  t.is(
    getHeader(
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      },
      'Content-Type',
    ),
    'text/plain',
  )

  t.is(
    getHeader(
      {
        headers: {
          'content-type': 'text/plain',
        },
      },
      'Content-Type',
    ),
    'text/plain',
  )
})
