/* @flow */
import test from 'ava'
import { withDirectory, writeFile } from 'passing-notes/test/helpers'
import { defaultBabelConfig, importModule } from 'passing-notes/lib/babel'

withDirectory()

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

  const add = importModule(defaultBabelConfig, directory)
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
  t.is(importModule(defaultBabelConfig, directory)(1, 2), 3)

  await writeFile(
    directory,
    'index.js',
    `
    export default function(x, y) {
      return x * y
    }
  `
  )
  t.is(importModule(defaultBabelConfig, directory)(1, 2), 2)
})
