import {setTimeout} from 'node:timers/promises'
import test from 'ava'
import Logger from './logger.js'

test('logging', async (t) => {
  const logger = new Logger()

  const events = []
  const lines = []
  logger.on('log', (event, line) => {
    events.push(event)
    lines.push(line)
  })

  logger.log({
    level: 'INFO',
    topic: 'Test',
    message: 'Hello World!',
  })

  t.like(events[0], {
    level: 'INFO',
    topic: 'Test',
    message: 'Hello World!',
  })
  t.true(lines[0].includes('[INFO] [Test] Hello World!'))

  t.true(Date.now() - events[0].time < 100)

  const [, timestamp] = lines[0].match(/^\[(.*?)]/)
  t.true(Date.now() - Date.parse(timestamp) < 100)

  const finish = logger.measure({
    level: 'INFO',
    topic: 'HTTP',
    message: 'GET /',
  })
  t.like(events[1], {
    level: 'INFO',
    topic: 'HTTP',
    message: 'GET /',
  })
  t.true(lines[1].includes('[INFO] [HTTP] GET /'))

  await setTimeout(100)
  finish({
    message: '200',
  })
  t.like(events[2], {
    level: 'INFO',
    topic: 'HTTP',
    message: 'GET / › 200',
  })
  t.true(events[2].duration > 100)
  t.true(events[2].duration < 150)
  t.true(lines[2].includes('[INFO] [HTTP] GET / › 200'))

  const error = new Error('Something went wrong')
  logger.log({
    level: 'ERROR',
    topic: 'Test',
    message: 'An error happened',
    error,
  })
  t.like(events[3], {
    level: 'ERROR',
    topic: 'Test',
    message: 'An error happened',
    error,
  })
  t.true(lines[3].includes('Error: Something went wrong'))
})
