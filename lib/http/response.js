/* @flow */
/* eslint-disable flowtype/no-weak-types */

export type Response = {
  status: number,
  headers: { [string]: string },
  body: any
}
