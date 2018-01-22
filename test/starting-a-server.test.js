/* @flow */
import test from 'ava'
import fetch from 'cross-fetch'
import getPort from 'get-port'
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

  const port = await getPort()
  const server = await start(['yarn', 'passing-notes', 'server.js'], {
    cwd: projectDirectory,
    env: { PORT: port },
    waitForOutput: 'Listening'
  })

  const response = await fetch(`http://localhost:${port}`)
  t.is(await response.text(), 'Hello World!')

  await stop(server)
})
