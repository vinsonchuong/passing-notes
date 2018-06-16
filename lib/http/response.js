/* @flow */

export type Response = {
  status: number,
  headers: { [string]: string },
  body: string | Buffer | stream$Readable
}
