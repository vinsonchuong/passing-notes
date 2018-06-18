/* @flow */

const startTimes = new WeakMap()

export function startTimer(obj: mixed): void {
  startTimes.set(obj, process.hrtime())
}

export function getTimeSince(obj: mixed): string {
  const interval = process.hrtime(startTimes.get(obj))
  const milliseconds = interval[0] * 1000 + interval[1] / 1e6
  return `${milliseconds.toFixed(2)}ms`
}
