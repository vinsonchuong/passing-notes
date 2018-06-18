/* @flow */
import test from 'ava'
import { format } from 'passing-notes/lib/log'

test('formatting log lines for tasks', t => {
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

test('formatting log lines with exceptions', t => {
  const start = {
    type: 'HTTP',
    message: 'GET /',
    error: new Error('Uncaught from Start')
  }

  const finish = {
    since: start,
    message: '500',
    error: new Error('Uncaught from Finish')
  }

  const startLogLine = format(start)
  t.regex(startLogLine, /\[HTTP] › GET \//)
  t.regex(startLogLine, /Error: Uncaught from Start/)
  t.regex(startLogLine, /index\.test\.js:29/)

  const finishLogLine = format(finish)
  t.regex(finishLogLine, /\[HTTP] › GET \/ › 500/)
  t.regex(finishLogLine, /Error: Uncaught from Finish/)
  t.regex(finishLogLine, /index\.test\.js:35/)
})
