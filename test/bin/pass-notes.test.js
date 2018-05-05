/* @flow */
import test from 'ava'
import { sendRequest } from 'passing-notes'
import { withProject, writeFile, start, stop } from 'passing-notes/test/helpers'

withProject()

test('starting a server', async t => {
  const { projectDirectory } = t.context
  await writeFile(
    projectDirectory,
    'server.js',
    `
    export default function(request, response) {
      response.writeHead(200, {
        'content-type': 'text/plain'
      })
      response.end('Hello World!')
    }
  `
  )

  const server = await start(['yarn', 'pass-notes', 'server.js'], {
    cwd: projectDirectory,
    env: { PORT: '10000' },
    waitForOutput: 'Listening'
  })

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10000'
  })

  t.is(response.body, 'Hello World!')

  await stop(server)
})
