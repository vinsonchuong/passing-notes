/* @flow */

export type StartEntry = {
  type: string,
  message: string,
  error?: Error
}

export type EndEntry = {
  message: string,
  error?: Error
}

export type Log = StartEntry => EndEntry => void
