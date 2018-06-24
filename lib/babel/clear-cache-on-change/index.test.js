/* @flow */
import test from 'ava'
import { withDirectory } from 'passing-notes/test/fixtures'
import { writeFile, sleep } from 'passing-notes/test/helpers'
import {
  clearCacheOnChange,
  importModule,
  defaultBabelConfig
} from 'passing-notes/lib/babel'

withDirectory({ perTest: true, key: 'directory' })

test('clearing the require cache with a file changes', async t => {
  const { directory } = t.context

  clearCacheOnChange(directory)

  await writeFile(
    directory,
    'index.js',
    'export { default as default } from "./number"'
  )
  await writeFile(directory, 'number.js', 'export default 42')

  t.is(importModule(defaultBabelConfig, directory), 42)
  await sleep(100)

  await writeFile(directory, 'number.js', 'export default 101')
  await sleep(100)

  t.is(importModule(defaultBabelConfig, directory), 101)
})
