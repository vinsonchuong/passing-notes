/* @flow */
import type { LogLine } from 'passing-notes/lib/log'
import formatError from './format-error'
import { startTimer, getTimeSince } from './timer'

export default function(logLine: LogLine): string {
  let firstLine
  if (logLine.since) {
    const { since, message } = logLine
    const sinceLog = formatFirstLine(since)
    const duration = getTimeSince(since)
    firstLine = `${sinceLog} › ${message} (${duration})`
  } else {
    startTimer(logLine)
    firstLine = formatFirstLine(logLine)
  }

  return logLine.error
    ? `${firstLine}\n${formatError(logLine.error)}`
    : firstLine
}

function formatFirstLine(fullLogLine) {
  const { type, message } = fullLogLine
  const timestamp = new Date().toISOString()
  return `[${timestamp}] [${type}] › ${message}`
}
