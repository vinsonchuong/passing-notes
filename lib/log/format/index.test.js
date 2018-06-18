/* @flow */
import test from 'ava'
import { format } from 'passing-notes/lib/log'

test('formatting log lines', t => {
  const start = {
    type: 'HTTP',
    message: 'Ping'
  }
  const finish = {
    since: start,
    message: 'Pong'
  }

  t.regex(
    format(start),
    /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z] \[HTTP] › Ping$/
  )
  t.regex(
    format(finish),
    /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z] \[HTTP] › Ping › Pong \(\d+\.\d\dms\)$/
  )
})
