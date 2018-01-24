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

  t.is(await fetchText(`http://localhost:${port}`), 'Hello World!')

  await stop(server)
})

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url)
  return response.text()
}
