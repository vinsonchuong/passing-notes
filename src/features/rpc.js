/* eslint-disable flowtype/no-weak-types */
/* @flow */
import type { Feature } from 'passing-notes'

// $FlowFixMe
type Procedure = (...parameters: Array<any>) => any

export default function(procedures: { [string]: Procedure }): Feature {
  return async (request, response, next) => {
    if (
      request.method === 'POST' &&
      request.url === '/rpc' &&
      request.headers['content-type'] === 'application/json'
    ) {
      const body = await new Promise(resolve => {
        let data = ''
        request.setEncoding('utf8')
        request.on('data', chunk => (data += chunk))
        request.on('end', () => resolve(data))
      })

      const { procedure, parameters } = JSON.parse(body)

      try {
        const result = procedures[procedure](...parameters)
        response.writeHead(200, {
          'Content-Type': 'application/json'
        })
        response.end(JSON.stringify({ result }))
      } catch (error) {
        response.writeHead(500, {
          'Content-Type': 'application/json'
        })
        response.end(JSON.stringify({ error: error.message }))
      }
    } else if (next) {
      next()
    }
  }
}
