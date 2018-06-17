/* @flow */
import test from 'ava'
import { format } from 'passing-notes/lib/log'

test('formatting a log line', t => {
  t.is(
    format({
      labels: ['One', 'Two'],
      messages: ['Ping', 'Pong']
    }),
    '[One] [Two] › Ping › Pong'
  )
})
