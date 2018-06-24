/* @flow */
import test from 'ava'
import { writeFile } from 'passing-notes/test/helpers'
import { withDirectory } from 'passing-notes/test/fixtures'
import { defaultBabelConfig, importModule } from 'passing-notes/lib/babel'

withDirectory({ perTest: true, key: 'directory' })

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
