#!/usr/bin/env node
/* @flow */
import 'dotenv/config'
import * as path from 'path'
import { compileApi } from 'passing-notes/lib/precompile'
import { printLog } from 'passing-notes/lib/log'
import { readJson } from 'fs-extra'

async function run() {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  const packageJson = await readJson(path.resolve('package.json'))
  const [, entry] = packageJson.scripts.start.match(/pass-notes (.*)/)

  const endLog = printLog({ type: 'CLI', message: 'Compiling API...' })
  try {
    await compileApi(entry)
    endLog({ type: 'CLI', message: 'Finished' })
  } catch (error) {
    endLog({ type: 'CLI', message: 'Failed', error })
  }
}

run()
