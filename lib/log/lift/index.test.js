/* @flow */
import test from 'ava'
import { withProject } from 'passing-notes/test/fixtures'
import { writeFile, start, stop } from 'passing-notes/test/helpers'

const testWithProject = withProject(test)

testWithProject('logging to stdout', async t => {
  const { project } = t.context

  await writeFile(
    project,
    'server.js',
    `
    import lift from 'passing-notes/lib/log/lift'
    console.log('<start>')
    lift('Ping')
    lift('Pong')
    console.log('<finish>')
  `
  )

  const server = await start(['yarn', 'pass-notes', 'server.js'], {
    cwd: project,
    env: { PORT: '10090' },
    waitForOutput: '<finish>'
  })

  const match = server.stdout.match(/<start>\n([\s\S]*)\n<finish>/)
  if (!match) {
    return t.fail()
  }
  const logLines = match[1].split('\n')

  t.is(logLines[0], 'Ping')
  t.is(logLines[1], 'Pong')

  await stop(server)
})
