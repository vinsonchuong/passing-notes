/* @flow */

type FullLogLine = {
  since?: empty,
  type: string,
  message: string,
  error?: Error
}

export type LogLine =
  | FullLogLine
  | { since: FullLogLine, message: string, error?: Error }
