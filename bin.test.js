import process from 'node:process'
import test from 'ava'
import {useTemporaryDirectory, runProcess, wait} from 'ava-patterns'
import install from 'quick-install'
import {sendRequest} from './index.js'

test('starting a development server with hot-reloading', async (t) => {
  const directory = await useTemporaryDirectory(t)

  await install(process.cwd(), directory.path)

  await directory.writeFile(
    'server.mjs',
    `
    export default () => {
      return {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Hello World!'
      }
    }
    `,
  )

  const server = runProcess(t, {
    command: ['npx', 'pass-notes', 'server.mjs'],
    cwd: directory.path,
    env: {PORT: '10010'},
  })
  try {
    await server.waitForOutput('Listening', 5000)
  } catch (error) {
    console.log(server.output)
    throw error
  }

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10010',
      headers: {},
    }),
    {
      status: 200,
      headers: {
        'content-type': 'text/plain',
      },
      body: 'Hello World!',
    },
  )

  await directory.writeFile(
    'server.mjs',
    `
    export default () => {
      return {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Hello There!'
      }
    }
    `,
  )
  await wait(500)

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10010',
      headers: {},
    }),
    {
      status: 200,
      headers: {
        'content-type': 'text/plain',
      },
      body: 'Hello There!',
    },
  )
})

test('not enabling hot-reloading in production', async (t) => {
  const directory = await useTemporaryDirectory(t)

  await install(process.cwd(), directory.path)

  await directory.writeFile(
    'server.mjs',
    `
    export default () => {
      return {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Hello World!'
      }
    }
    `,
  )

  const server = runProcess(t, {
    command: ['npx', 'pass-notes', 'server.mjs'],
    cwd: directory.path,
    env: {PORT: '10011', NODE_ENV: 'production'},
  })
  try {
    await server.waitForOutput('Listening', 5000)
  } catch (error) {
    console.log(server.output)
    throw error
  }

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10011',
      headers: {},
    }),
    {
      body: 'Hello World!',
    },
  )

  await directory.writeFile(
    'server.mjs',
    `
    export default () => {
      return {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Hello There!'
      }
    }
    `,
  )
  await wait(500)

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10011',
      headers: {},
    }),
    {
      body: 'Hello World!',
    },
  )
})
