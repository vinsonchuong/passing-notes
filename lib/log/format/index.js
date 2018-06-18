/* @flow */
import type { LogLine } from 'passing-notes/lib/log'

const startTimes = new WeakMap()

export default function(logLine: LogLine): string {
  if (logLine.since) {
    const { since, message } = logLine

    const interval = process.hrtime(startTimes.get(since))
    const milliseconds = interval[0] * 1000 + interval[1] / 1e6

    // prettier-ignore
    return `[${getTimestamp()}] [${since.type}] › ${since.message} › ${message} (${milliseconds.toFixed(2)}ms)`
  } else {
    startTimes.set(logLine, process.hrtime())

    const { type, message } = logLine
    return `[${getTimestamp()}] [${type}] › ${message}`
  }
}

function getTimestamp() {
  return new Date().toISOString()
}
