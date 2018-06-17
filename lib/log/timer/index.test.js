/* @flow */
import test from 'ava'
import { startTimer, endTimer } from 'passing-notes/lib/log'

test('logging the start and end of a task', t => {
  const startLogLine = startTimer({
    labels: ['Hello'],
    messages: ['Start']
  })
  t.deepEqual(startLogLine.labels, ['Hello'])
  t.deepEqual(startLogLine.messages, ['Start'])

  const endLogLine = endTimer(startLogLine, 'Finish')
  t.deepEqual(endLogLine.labels, ['Hello'])
  t.is(endLogLine.messages[0], 'Start')
  t.regex(endLogLine.messages[1], /^Finish \(\d+\.\d\dms\)$/)
})
