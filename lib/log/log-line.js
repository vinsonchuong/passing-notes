/* @flow */

type FullLogLine = { since?: empty, type: string, message: string }

export type LogLine = FullLogLine | { since: FullLogLine, message: string }
