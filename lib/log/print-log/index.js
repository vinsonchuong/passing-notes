/* @flow */
import type { StartEntry, EndEntry } from 'passing-notes/lib/log'
import { format } from 'passing-notes/lib/log'

export default function(startEntry: StartEntry): EndEntry => void {
  const startHrtime = process.hrtime()

  console.log(
    format({
      date: new Date(),
      type: startEntry.type,
      startMessage: startEntry.message,
      error: startEntry.error
    })
  )

  return endEntry => {
    const endHrtime = process.hrtime()
    const duration =
      (endHrtime[0] - startHrtime[0]) * 1000 +
      (endHrtime[1] - startHrtime[1]) / 1e6

    console.log(
      format({
        date: new Date(),
        type: startEntry.type,
        startMessage: startEntry.message,
        endMessage: endEntry.message,
        duration,
        error: endEntry.error
      })
    )
  }
}
