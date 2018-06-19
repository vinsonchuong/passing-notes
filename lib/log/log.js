/* @flow */

export type Log = {
  date: Date,
  hrtime: [number, number],
  type: string,
  message: string,
  error?: Error
}
