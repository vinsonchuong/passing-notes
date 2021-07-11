import * as https from 'node:https'
import test from 'ava'
import {useTemporaryDirectory} from 'ava-patterns'
import install from 'quick-install'
import makeCert from 'make-cert'
import {stopServer, sendRequest} from '../index.js'
import cli from './index.js'

async function runScript(t, env, script) {
  const directory = await useTemporaryDirectory(t)
  await install(process.cwd(), directory.path)

  await directory.writeFile('server.mjs', script)

  const output = []

  const server = await cli({
    argv: ['node', 'bin.js', 'server.mjs'],
    cwd: directory.path,
    env,
    stdout: {
      write(text) {
        output.push(text)
      }
    }
  })
  t.teardown(async () => {
    await stopServer(server)
  })

  return output
}

test('running the CLI', async (t) => {
  const output = await runScript(
    t,
    {PORT: '11000'},
    `

    export default function () {
      return {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Hello World!'
      }
    }
    `
  )

  t.true(output[0].includes('Listening on port 11000'))

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:11000',
      headers: {}
    }),
    {
      status: 200,
      headers: {
        'content-type': 'text/plain'
      },
      body: 'Hello World!'
    }
  )
})

test('defaulting to port 8080', async (t) => {
  const output = await runScript(
    t,
    {},
    `
    export default function () {
      return {
        status: 200,
        headers: {},
        body: 'Hello World!'
      }
    }
    `
  )

  t.true(output[0].includes('Listening on port 8080'))

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:8080',
      headers: {}
    }),
    {status: 200}
  )
})

test('gracefully handling errors', async (t) => {
  await runScript(
    t,
    {PORT: '11001'},
    `
    export default function () {
      throw new Error('Something bad happened.')
    }
    `
  )

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:11001',
      headers: {}
    }),
    {
      status: 500,
      body: 'Something bad happened.'
    }
  )
})

function getCertificate(url) {
  return new Promise((resolve) => {
    https
      .get(url, {rejectUnauthorized: false}, (response) => {
        resolve(response.connection.getPeerCertificate())
      })
      .end()
  })
}

test('automatically creating a self-signed certificate for localhost', async (t) => {
  await runScript(
    t,
    {PORT: '11002'},
    `
    export default function () {
      return {
        status: 200,
        headers: {},
        body: 'Hello World!'
      }
    }
    `
  )

  t.like(await getCertificate('https://localhost:11002'), {
    subject: {CN: 'localhost'}
  })
})

test('allowing a certificate to be provided via environment variables', async (t) => {
  const {key, cert} = await makeCert('foo')

  await runScript(
    t,
    {PORT: '11003', KEY: key, CERT: cert},
    `
    export default function () {
      return {
        status: 200,
        headers: {},
        body: 'Hello World!'
      }
    }
    `
  )

  t.like(await getCertificate('https://localhost:11003'), {
    subject: {CN: 'foo'}
  })
})

test('allowing a certificate to be provided in application code', async (t) => {
  const {key, cert} = await makeCert('bar')

  await runScript(
    t,
    {PORT: '11004'},
    `
    export const tls = {
      key: \`${key}\`,
      cert: \`${cert}\`
    }

    export default function () {
      return {
        status: 200,
        headers: {},
        body: 'Hello World!'
      }
    }
    `
  )

  t.like(await getCertificate('https://localhost:11004'), {
    subject: {CN: 'bar'}
  })
})

test('logging requests', async (t) => {
  const output = await runScript(
    t,
    {PORT: '11005'},
    `
    export default function (request) {
      if (request.url === '/error') {
        throw new Error('Bad')
      }

      return {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Hello World!'
      }
    }
    `
  )

  await sendRequest({
    method: 'GET',
    url: 'http://localhost:11005/foo',
    headers: {}
  })
  t.true(output[1].includes('[INFO] [HTTP] GET /foo'))
  t.true(output[2].includes('[INFO] [HTTP] GET /foo › 200'))

  await sendRequest({
    method: 'POST',
    url: 'http://localhost:11005/bar',
    headers: {},
    body: ''
  })
  t.true(output[3].includes('[INFO] [HTTP] POST /bar'))
  t.true(output[4].includes('[INFO] [HTTP] POST /bar › 200'))

  await sendRequest({
    method: 'GET',
    url: 'http://localhost:11005/error',
    headers: {}
  })
  t.true(output[5].includes('[INFO] [HTTP] GET /error'))
  t.true(output[6].includes('[ERROR] [HTTP] GET /error › 500'))
  t.true(output[6].includes('Error: Bad'))
})

test('using a custom logger', async (t) => {
  const output = await runScript(
    t,
    {PORT: '11006'},
    `
    import {Logger} from 'passing-notes'

    export const logger = new Logger()

    export default function (request) {
      logger.log({level: 'INFO', topic: 'APP', message: 'Hello World!'})
      return {status: 200}
    }
    `
  )

  await sendRequest({
    method: 'GET',
    url: 'http://localhost:11006',
    headers: {}
  })
  t.true(output[1].includes('[INFO] [HTTP] GET /'))
  t.true(output[2].includes('[INFO] [APP] Hello World!'))
  t.true(output[3].includes('[INFO] [HTTP] GET / › 200'))
})
