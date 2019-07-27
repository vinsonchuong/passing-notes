/* @flow */
import test from 'ava'
import { promisify } from 'util'
import { sendRequest } from 'passing-notes'
import { writeFile, start, stop } from 'passing-notes/test/helpers'
import { withProject } from 'passing-notes/test/fixtures'
import { fromWebSocket } from 'heliograph'

const sleep = promisify(setTimeout)
const testWithProject = withProject(test)

testWithProject.serial(
  'loading environment variables and optionally handling HTTP or WebSocket connections',
  async t => {
    const { project } = t.context
    await writeFile(
      project,
      '.env',
      `
      HTTP_MESSAGE='This is HTTP!'
      WS_MESSAGE='This is WebSocket!'
      `
    )
    await writeFile(project, 'server.js', '')

    const server = await start(['yarn', 'pass-notes', 'server.js'], {
      cwd: project,
      env: { PORT: '10000' },
      waitForOutput: 'Listening'
    })

    await t.notThrowsAsync(
      sendRequest({
        method: 'GET',
        url: 'http://localhost:10000',
        headers: {},
        body: ''
      })
    )
    await t.throwsAsync(fromWebSocket('ws://localhost:10000'))

    await sleep(200)
    await writeFile(
      project,
      'server.js',
      `
    import { respondToRequests } from 'passing-notes/lib/http'

    export default respondToRequests(
      next => async request => ({
        status: 200,
        headers: {
          'content-type': 'text/plain'
        },
        body: process.env.HTTP_MESSAGE
      })
    )
  `
    )
    await sleep(200)
    {
      const response = await sendRequest({
        method: 'GET',
        url: 'http://localhost:10000',
        headers: {},
        body: ''
      })
      t.is(response.body, 'This is HTTP!')
    }
    await t.throwsAsync(fromWebSocket('ws://localhost:10000'))

    await sleep(200)
    await writeFile(
      project,
      'server.js',
      `
    import { respondToRequests } from 'passing-notes/lib/http'
    import { acceptConnections } from 'passing-notes/lib/web-socket'

    export const http = respondToRequests(
      next => async request => ({
        status: 200,
        headers: {
          'content-type': 'text/plain'
        },
        body: process.env.HTTP_MESSAGE
      })
    )

    export const webSocket = acceptConnections(async socket => {
      await socket.send(process.env.WS_MESSAGE)
    })
  `
    )

    {
      const response = await sendRequest({
        method: 'GET',
        url: 'http://localhost:10000',
        headers: {},
        body: ''
      })
      t.is(response.body, 'This is HTTP!')
    }

    {
      const socket = await fromWebSocket('ws://localhost:10000')
      t.is((await socket.next()).value, 'This is WebSocket!')
      await socket.close()
    }

    await stop(server)
  }
)
