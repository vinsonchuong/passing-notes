/* @flow */
import test from 'ava'
import { sendRequest } from 'passing-notes'
import { writeFile, start, stop, sleep } from 'passing-notes/test/helpers'
import { withProject } from 'passing-notes/test/fixtures'

withProject({ perTest: true, key: 'project' })

test('starting a server defaulting to server.js', async t => {
  const { project } = t.context
  await writeFile(
    project.directory,
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
    cwd: project.directory,
    env: { PORT: '10000' },
    waitForOutput: 'Listening'
  })

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10000',
    headers: {},
    body: ''
  })

  t.is(response.body, 'Hello World!')

  await stop(server)
})

test('starting a server and specifying the entrypoint', async t => {
  const { project } = t.context
  await writeFile(
    project.directory,
    'myserver.js',
    `
    export default function(request, response) {
      response.writeHead(200, {
        'content-type': 'text/plain'
      })
      response.end('Hello World!')
    }
  `
  )

  const server = await start(['yarn', 'pass-notes', 'myserver.js'], {
    cwd: project.directory,
    env: { PORT: '10001' },
    waitForOutput: 'Listening'
  })

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10001',
    headers: {},
    body: ''
  })

  t.is(response.body, 'Hello World!')

  await stop(server)
})
