/* @flow */
import test from 'ava'
import { withDirectory, writeFile } from './helpers'
import importModule from 'passing-notes/src/import-module'

withDirectory()

const babelConfig = { presets: [require('babel-preset-diff')] }

test('importing a module', async t => {
  const { directory } = t.context
  await writeFile(
    directory,
    'index.js',
    `
    export default function(x, y) {
      return x + y
    }
  `
  )

  const add = importModule(babelConfig, directory)
  t.is(add(1, 2), 3)
})

test('reloading code', async t => {
  const { directory } = t.context

  await writeFile(
    directory,
    'index.js',
    `
    export default function(x, y) {
      return x + y
    }
  `
  )
  t.is(importModule(babelConfig, directory)(1, 2), 3)

  await writeFile(
    directory,
    'index.js',
    `
    export default function(x, y) {
      return x * y
    }
  `
  )
  t.is(importModule(babelConfig, directory)(1, 2), 2)
})
