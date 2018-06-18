/* @flow */
import test from 'ava'
import { withProject } from 'passing-notes/test/fixtures'
import { writeFile, start, stop } from 'passing-notes/test/helpers'

withProject({ key: 'project', perTest: true })

test('logging formatted logs to stdout', async t => {
  const { project } = t.context

  await writeFile(
    project.directory,
    'server.js',
    `
    import log from 'passing-notes/lib/log'
    console.log('<start>')
    const start = { label: 'HTTP', message: 'Ping' }
    log(start)
    log({ since: start, message: 'Pong' })
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
