/* @flow */
import test from 'ava'
import { promisify } from 'util'
import { sendRequest } from 'passing-notes'
import { writeFile, start, stop } from 'passing-notes/test/helpers'
import { withProject } from 'passing-notes/test/fixtures'

const sleep = promisify(setTimeout)
const testWithProject = withProject(test)

testWithProject('starting a server defaulting to server.js', async t => {
  const { project } = t.context
  await writeFile(
    project,
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

  const server = await start(['yarn', 'pass-notes'], {
    cwd: project,
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

testWithProject('starting a server and specifying the entrypoint', async t => {
  const { project } = t.context
  await writeFile(
    project,
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
    cwd: project,
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

testWithProject('hot-reloading', async t => {
  const { project } = t.context
  await writeFile(
    project,
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

  const server = await start(['yarn', 'pass-notes'], {
    cwd: project,
    env: { PORT: '10002' },
    waitForOutput: 'Listening'
  })

  await sleep(1000)

  await writeFile(
    project,
    'server.js',
    `
    export default function(request, response) {
      response.writeHead(200, {
        'content-type': 'text/plain'
      })
      response.end('Hello There!')
    }
  `
  )

  await sleep(1000)

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10002',
    headers: {},
    body: ''
  })

  t.is(response.body, 'Hello There!')

  await stop(server)
})

testWithProject('not hot-reloading when NODE_ENV=production', async t => {
  const { project } = t.context
  await writeFile(
    project,
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

  const server = await start(['yarn', 'pass-notes'], {
    cwd: project,
    env: {
      PORT: '10003',
      NODE_ENV: 'production'
    },
    waitForOutput: 'Listening'
  })

  await writeFile(
    project,
    'server.js',
    `
    export default function(request, response) {
      response.writeHead(200, {
        'content-type': 'text/plain'
      })
      response.end('Hello There!')
    }
  `
  )

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10003',
    headers: {},
    body: ''
  })

  t.is(response.body, 'Hello World!')

  await stop(server)
})

testWithProject('gracefully handling errors thrown on import', async t => {
  const { project } = t.context
  await writeFile(project, 'server.js', `throw new Error('Error on Import')`)

  await t.throwsAsync(
    start(['yarn', 'pass-notes'], {
      cwd: project,
      env: { PORT: '10004' },
      waitForOutput: 'Listening'
    })
  )
})

testWithProject('loading environment variables from .env', async t => {
  const { project } = t.context
  await writeFile(
    project,
    '.env',
    `
    MESSAGE='Something Here'
  `
  )
  await writeFile(
    project,
    'server.js',
    `
    export default function(request, response) {
      response.writeHead(200, {
        'content-type': 'text/plain'
      })
      response.end(process.env.MESSAGE)
    }
  `
  )

  const server = await start(['yarn', 'pass-notes'], {
    cwd: project,
    env: { PORT: '10005' },
    waitForOutput: 'Listening'
  })

  const response = await sendRequest({
    method: 'GET',
    url: 'http://localhost:10005',
    headers: {},
    body: ''
  })

  t.is(response.body, 'Something Here')

  await stop(server)
})
