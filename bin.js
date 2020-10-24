#!/usr/bin/env node
import {createRequire} from 'module'
import run from 'puff-pastry'

const require = createRequire(import.meta.url)
const hotEsmPath = require.resolve('hot-esm')

run('./cli/index.js', {
  flags: ['--loader', hotEsmPath, '--no-warnings']
})
