/* @flow */
import formatError from './format-error'

export default function({
  date,
  type,
  startMessage,
  endMessage,
  duration,
  error
}: {
  date: Date,
  type: string,
  startMessage: string,
  endMessage?: ?string,
  duration?: ?number,
  error?: ?Error
}) {
  let line = `[${date.toISOString()}] [${type}] › ${startMessage}`
  if (endMessage) line += ` › ${endMessage}`
  if (duration) line += ` (${duration.toFixed(2)}ms)`
  if (error) line += `\n${formatError(error)}`
  return line
}
