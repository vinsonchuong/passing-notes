/* @flow */
import test from 'ava'
import { start, stop } from 'passing-notes/test/helpers'
import { withExampleProject } from 'passing-notes/test/fixtures'
import { sendRequest } from 'passing-notes'

const testWithProject = withExampleProject(test, 'serving-a-rest-api')

testWithProject('serving a REST API', async t => {
  const { project } = t.context

  const server = await start(['yarn', 'start'], {
    cwd: project,
    env: { PORT: '30020' },
    waitForOutput: 'Listening'
  })

  t.deepEqual(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:30020/things',
      headers: {},
      body: ''
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ things: [] })
    }
  )

  t.deepEqual(
    await sendRequest({
      method: 'POST',
      url: 'http://localhost:30020/things',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Something' })
    }),
    {
      status: 201,
      headers: {},
      body: ''
    }
  )

  t.deepEqual(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:30020/things',
      headers: {},
      body: ''
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        things: [{ name: 'Something' }]
      })
    }
  )

  await stop(server)
})
