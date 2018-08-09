/* @flow */
import ava from 'ava'
import { flow } from 'lodash'
import td from 'testdouble'
import { withDirectory } from 'passing-notes/test/fixtures'
import { writeFile, sleep } from 'passing-notes/test/helpers'
import {
  clearCacheOnChange,
  importModule,
  defaultBabelConfig
} from 'passing-notes/lib/babel'

const test = flow(withDirectory)(ava)

test('clearing the require cache and logging with a file changes', async t => {
  const { directory } = t.context
  const log = td.func()

  await writeFile(
    directory,
    'index.js',
    'export { default as default } from "./lib/number"'
  )
  await writeFile(directory, 'lib', 'number.js', 'export default 42')

  clearCacheOnChange({ directory, log })

  t.is(importModule(defaultBabelConfig, directory), 42)
  await sleep(100)

  await writeFile(directory, 'lib', 'number.js', 'export default 101')
  await sleep(100)

  t.is(importModule(defaultBabelConfig, directory), 101)
  td.verify(
    log(td.matchers.contains({ type: 'CLI', message: 'Reloading API' })),
    { times: 1 }
  )

  await writeFile(directory, 'index.js', 'export default 202')
  await sleep(100)

  t.is(importModule(defaultBabelConfig, directory), 202)
  td.verify(
    log(td.matchers.contains({ type: 'CLI', message: 'Reloading API' })),
    { times: 2 }
  )
})
