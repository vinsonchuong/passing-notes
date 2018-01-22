/* @flow */
import getPort from 'get-port'

export default async function(): Promise<number> {
  if (process.env.PORT && !Number.isNaN(Number(process.env.PORT))) {
    return Number(process.env.PORT)
  } else {
    return getPort({ port: 8080 })
  }
}
