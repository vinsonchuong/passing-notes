/* @flow */
import type { Log } from 'passing-notes/lib/log'
import formatError from './format-error'

export default function(log: Log, finishLog: ?Log): string {
  if (finishLog) {
    const startLogFirstLine = formatFirstLine(log)

    const milliseconds =
      (finishLog.hrtime[0] - log.hrtime[0]) * 1000 +
      (finishLog.hrtime[1] - log.hrtime[1]) / 1e6
    const duration = `${milliseconds.toFixed(2)}ms`

    const firstLine = `${startLogFirstLine} › ${
      finishLog.message
    } (${duration})`
    return finishLog.error
      ? `${firstLine}\n${formatError(finishLog.error)}`
      : firstLine
  } else {
    const firstLine = formatFirstLine(log)
    return log.error ? `${firstLine}\n${formatError(log.error)}` : firstLine
  }
}

function formatFirstLine(log) {
  const { date, type, message } = log
  const timestamp = date.toISOString()
  return `[${timestamp}] [${type}] › ${message}`
}
