/* @flow */
/* eslint-disable flowtype/no-weak-types */
import { sendRequest } from 'passing-notes/lib/http'

export default function<Actions: {}>(
  url: string
): $ObjMap<
  Actions,
  <Dependencies, Params, Result>(
    (Dependencies) => (...Params) => Result
  ) => (...Params) => Promise<Result>
> {
  const client = new Proxy(
    {},
    {
      get(target, action) {
        return async (...params) => {
          const httpResponse = await sendRequest({
            method: 'POST',
            url,
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({ action, params })
          })

          if (
            httpResponse.headers['content-type'] !== 'application/json' ||
            typeof httpResponse.body !== 'string'
          ) {
            throw new Error('Server did not respond with JSON')
          }

          const { error, result } = JSON.parse(httpResponse.body)

          if (error) {
            throw new Error(error)
          }
          return result
        }
      }
    }
  )

  return ((client: any): Client)
}
