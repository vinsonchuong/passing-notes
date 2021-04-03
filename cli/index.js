import path from 'path'
import makeCert from 'make-cert'
import {startServer, Logger} from '../index.js'
import findOpenPort from './find-open-port.js'

export default async function ({cwd, env, argv, stdout}) {
  const defaultLogger = new Logger()
  defaultLogger.on('log', (event, line) => {
    stdout.write(`${line}\n`)
  })

  let logger = defaultLogger

  const appPath = argv[2]
  const port = await findOpenPort(Number(env.PORT), 8080)

  const app = await import(path.join(cwd, appPath))

  if ('logger' in app) {
    logger = app.logger
    logger.on('log', (event, line) => {
      stdout.write(`${line}\n`)
    })
  }

  const tlsConfig = {}
  if ('KEY' in env && 'CERT' in env) {
    tlsConfig.key = env.KEY
    tlsConfig.cert = env.CERT
  } else if ('tls' in app) {
    Object.assign(tlsConfig, app.tls)
  } else if (env.NODE_ENV !== 'production') {
    Object.assign(tlsConfig, makeCert('localhost'))
  }

  const server = await startServer({port, ...tlsConfig}, async (request) => {
    let response
    let error

    const finish = logger.measure({
      level: 'INFO',
      topic: 'HTTP',
      message: `${request.method} ${request.url}`
    })

    try {
      const app = await import(path.join(cwd, appPath))

      if (!('logger' in app)) {
        logger = defaultLogger
      } else if (logger !== app.logger) {
        logger = app.logger
        logger.on('log', (event, line) => {
          stdout.write(`${line}\n`)
        })
      }

      response = await app.default(request)
    } catch (error_) {
      response = {
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: error_.message
      }
      error = error_
    }

    finish({
      level: error ? 'ERROR' : 'INFO',
      message: `${response.status}`,
      error
    })

    return response
  })

  logger.log({
    level: 'INFO',
    topic: 'HTTP',
    message: `Listening on port ${port}`
  })

  return server
}
