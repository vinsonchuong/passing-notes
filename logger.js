import EventEmitter from 'events'
import prettyMs from 'pretty-ms'
import indent from 'indent-string'

export default class extends EventEmitter {
  constructor(overrides) {
    super()
    Object.assign(this, overrides)
  }

  measure(startEvent) {
    const startTime = process.hrtime()
    this.log(startEvent)

    return (endEvent) => {
      const endTime = process.hrtime(startTime)
      const duration = endTime[0] * 1e3 + endTime[1] * 1e-6
      this.log({
        ...startEvent,
        ...endEvent,
        message: `${startEvent.message} › ${endEvent.message}`,
        duration
      })
    }
  }

  log(event) {
    event = {
      ...event,
      time: Date.now()
    }
    this.emit('log', event, this.format(event))
  }

  format(event) {
    const timestamp = new Date(event.time).toISOString()
    let line = `[${timestamp}] [${event.level}] [${event.topic}] ${event.message}`

    if (event.duration) {
      line += ` (${prettyMs(event.duration)})`
    }

    if (event.error) {
      line += `\n${indent(event.error.stack, 4)}`
    }

    return line
  }
}
