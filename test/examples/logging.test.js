/* @flow */
import test from 'ava'
import { start, stop } from 'passing-notes/test/helpers'
import { withExampleProject } from 'passing-notes/test/fixtures'
import { sendRequest } from 'passing-notes'

withExampleProject({
  perTest: true,
  key: 'project',
  fixtureName: 'logging'
})

test('serving a UI', async t => {
  const { project } = t.context

  const server = await start(['yarn', 'start'], {
    cwd: project.directory,
    env: { PORT: '30010' },
    waitForOutput: 'Listening'
  })

  await sendRequest({
    method: 'GET',
    url: 'http://localhost:30010/ping',
    headers: {},
    body: ''
  })
  t.regex(server.stdout, /GET \/ping › 200/)

  await sendRequest({
    method: 'GET',
    url: 'http://localhost:30010/error',
    headers: {},
    body: ''
  })
  t.regex(server.stdout, /GET \/error › 500/)
  t.regex(server.stdout, /Error: Unknown URL/)

  await stop(server)
})
