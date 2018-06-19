/* @flow */
import test from 'ava'
import { format } from 'passing-notes/lib/log'

test('formatting log lines for tasks', t => {
  const start = {
    date: new Date('2018-01-01T00:00:00.000Z'),
    hrtime: [0, 0],
    type: 'HTTP',
    message: 'Ping'
  }
  const finish = {
    date: new Date('2018-01-01T00:00:00.200Z'),
    hrtime: [0, 2e8],
    type: 'HTTP',
    message: 'Pong'
  }

  t.is(format(start), '[2018-01-01T00:00:00.000Z] [HTTP] › Ping')
  t.is(
    format(start, finish),
    '[2018-01-01T00:00:00.000Z] [HTTP] › Ping › Pong (200.00ms)'
  )
})

test('formatting log lines with exceptions', t => {
  const start = {
    date: new Date('2018-01-01T00:00:00.000Z'),
    hrtime: [0, 0],
    type: 'HTTP',
    message: 'GET /',
    error: new Error('Uncaught from Start')
  }

  const finish = {
    date: new Date('2018-01-01T00:00:00.200Z'),
    hrtime: [0, 2e8],
    type: 'HTTP',
    message: '500',
    error: new Error('Uncaught from Finish')
  }

  const startLogLine = format(start)
  t.regex(startLogLine, /\[HTTP] › GET \//)
  t.regex(startLogLine, /Error: Uncaught from Start/)
  t.regex(startLogLine, /index\.test\.js:32/)

  const finishLogLine = format(start, finish)
  t.regex(finishLogLine, /\[HTTP] › GET \/ › 500/)
  t.regex(finishLogLine, /Error: Uncaught from Finish/)
  t.regex(finishLogLine, /index\.test\.js:40/)
})
