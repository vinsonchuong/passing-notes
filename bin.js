#!/usr/bin/env node
import process from 'node:process'
import {createRequire} from 'node:module'
import run from 'puff-pastry'

const require = createRequire(import.meta.url)
const hotEsmPath = require.resolve('hot-esm')

if (process.env.NODE_ENV === 'production') {
  run('./cli/index.js')
} else {
  run('./cli/index.js', {
    flags: ['--loader', hotEsmPath, '--no-warnings'],
  })
}
