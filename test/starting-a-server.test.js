/* @flow */
import test from 'ava'
import { getPort, fetchText } from 'passing-notes/src/http'
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
    env: { PORT: String(port) },
    waitForOutput: 'Listening'
  })

  t.is(await fetchText(`http://localhost:${port}`), 'Hello World!')

  await stop(server)
})
