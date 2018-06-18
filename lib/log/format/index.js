/* @flow */
import type { LogLine } from 'passing-notes/lib/log'
import formatError from './format-error'
import { startTimer, getTimeSince } from './timer'

export default function(logLine: LogLine): string {
  if (logLine.since) {
    const { since, message } = logLine
    const sinceLog = formatFullLogLine(since)
    const duration = getTimeSince(since)
    return `${sinceLog} › ${message} (${duration})`
  } else {
    startTimer(logLine)
    return formatFullLogLine(logLine)
  }
}

function formatFullLogLine(fullLogLine) {
  const { type, message, error } = fullLogLine
  const timestamp = new Date().toISOString()

  const firstLine = `[${timestamp}] [${type}] › ${message}`
  return error ? `${firstLine}\n${formatError(error)}` : firstLine
}
