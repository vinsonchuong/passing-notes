/* @flow */

export type Request = {
  method: string,
  url: string,
  headers: { [string]: string },
  body: string | Buffer | Blob
}
