/* @flow */
import type { Log } from 'passing-notes/lib/log'
import { lift, format } from 'passing-notes/lib/log'

export default function(log: Log, finishLog: ?Log): void {
  return lift(format(log, finishLog))
}
