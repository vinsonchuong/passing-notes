/* @flow */
import test from 'ava'
import { format } from 'passing-notes/lib/log'

test('formatting a log', t => {
  t.is(
    format({
      date: new Date('2018-01-01T00:00:00.000Z'),
      type: 'HTTP',
      startMessage: 'Ping'
    }),
    '[2018-01-01T00:00:00.000Z] [HTTP] › Ping'
  )
})

test('formatting an end log with duration', t => {
  t.is(
    format({
      date: new Date('2018-01-01T00:00:00.000Z'),
      type: 'HTTP',
      startMessage: 'Ping',
      endMessage: 'Pong',
      duration: 200
    }),
    '[2018-01-01T00:00:00.000Z] [HTTP] › Ping › Pong (200.00ms)'
  )
})

test('formatting a start log with an error', t => {
  const logLine = format({
    date: new Date('2018-01-01T00:00:00.000Z'),
    type: 'HTTP',
    startMessage: 'GET /',
    error: new Error('Uncaught from Start')
  })

  t.regex(logLine, /\[HTTP] › GET \//)
  t.regex(logLine, /Error: Uncaught from Start/)
  t.regex(logLine, /index\.test\.js:34/)
})

test('formatting an end log with an error', t => {
  const logLine = format({
    date: new Date('2018-01-01T00:00:00.200Z'),
    type: 'HTTP',
    startMessage: 'GET /',
    endMessage: '500',
    error: new Error('Uncaught from Finish')
  })

  t.regex(logLine, /\[HTTP] › GET \/ › 500/)
  t.regex(logLine, /Error: Uncaught from Finish/)
  t.regex(logLine, /index\.test\.js:48/)
})
