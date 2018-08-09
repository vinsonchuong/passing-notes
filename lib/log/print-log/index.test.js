/* @flow */
import ava from 'ava'
import { flow } from 'lodash'
import { withProject } from 'passing-notes/test/fixtures'
import { writeFile, start, stop } from 'passing-notes/test/helpers'

const test = flow(withProject)(ava)

test('printing formatted logs to stdout', async t => {
  const { project } = t.context

  await writeFile(
    project.directory,
    'server.js',
    `
    import { printLog } from 'passing-notes/lib/log'
    console.log('<start>')
    const start = {
      date: new Date(),
      hrtime: process.hrtime(),
      type: 'HTTP',
      message: 'Ping'
    }
    printLog(start)

    const finish = {
      date: new Date(),
      hrtime: process.hrtime(),
      type: 'HTTP',
      message: 'Pong'
    }
    printLog(start, finish)
    console.log('<finish>')
  `
  )

  const server = await start(['yarn', 'pass-notes', 'server.js'], {
    cwd: project.directory,
    env: { PORT: '10091' },
    waitForOutput: '<finish>'
  })

  const match = server.stdout.match(/<start>\n([\s\S]*)\n<finish>/)
  if (!match) {
    return t.fail()
  }
  const logLines = match[1].split('\n')

  t.regex(logLines[0], /Ping/)
  t.regex(logLines[1], /Ping › Pong/)

  await stop(server)
})
