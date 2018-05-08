/* @flow */
/* eslint-disable flowtype/no-weak-types */

export type Request = {
  method: string,
  url: string,
  headers: { [string]: string },
  body?: any
}
