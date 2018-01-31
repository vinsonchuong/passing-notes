/* @flow */
import test from 'ava'
import { fetchText } from 'passing-notes/src/http'
import { withProject, writeFile, start, stop } from './helpers'

withProject()

test('starting a server', async t => {
  const { projectDirectory } = t.context
  await writeFile(
    projectDirectory,
    'server.js',
    `
    export default function(request, response) {
      response.end('Hello World!')
    }
  `
  )

  const server = await start(['yarn', 'pass-notes', 'server.js'], {
    cwd: projectDirectory,
    env: { PORT: '10000' },
    waitForOutput: 'Listening'
  })

  t.is(await fetchText('http://localhost:10000'), 'Hello World!')

  await stop(server)
})
