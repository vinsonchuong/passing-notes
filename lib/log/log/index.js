/* @flow */
import type { LogLine } from 'passing-notes/lib/log'
import { lift, format } from 'passing-notes/lib/log'

export default function(logLine: LogLine): void {
  return lift(format(logLine))
}
