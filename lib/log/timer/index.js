/* @flow */
import type { LogLine } from 'passing-notes/lib/log'

type TimedLogLine = LogLine & { startTime: [number, number] }

export function startTimer(startLogLine: LogLine): TimedLogLine {
  return {
    ...startLogLine,
    startTime: process.hrtime()
  }
}

export function endTimer(
  startLogLine: TimedLogLine,
  endMessage: string
): LogLine {
  const interval = process.hrtime(startLogLine.startTime)
  const milliseconds = interval[0] * 1000 + interval[1] / 1e6

  return {
    labels: startLogLine.labels,
    messages: [
      ...startLogLine.messages,
      `${endMessage} (${milliseconds.toFixed(2)}ms)`
    ]
  }
}
