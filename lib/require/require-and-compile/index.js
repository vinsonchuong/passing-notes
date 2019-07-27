/* @flow */
import type { Log } from 'passing-notes/lib/log'

type Config = {
  modulePath: string,
  log: Log
}

export default function<Module>({ modulePath, log }: Config): ?Module {
  require('overdub/register')
  const endLog = log({ type: 'CLI', message: 'Compiling API...' })

  try {
    // $FlowFixMe
    const loadedModule = require(modulePath)
    endLog({ type: 'CLI', message: 'Finished' })
    return loadedModule
  } catch (error) {
    endLog({ type: 'CLI', message: 'Failed', error })
    return null
  }
}
