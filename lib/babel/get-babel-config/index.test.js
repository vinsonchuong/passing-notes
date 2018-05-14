/* @flow */
import test from 'ava'
import { withDirectory, writeFile } from 'passing-notes/test/helpers'
import { getBabelConfig } from 'passing-notes/lib/babel'

withDirectory({ perTest: true, key: 'directory' })

test.serial('providing defaults', async t => {
  const { directory } = t.context

  await writeFile(directory, 'package.json', '{}')

  t.deepEqual(await getBabelConfig(directory), {
    presets: [require('babel-preset-diff')]
  })
})

test.serial('allowing user overrides', async t => {
  const { directory } = t.context

  await writeFile(
    directory,
    'package.json',
    `
    {
      "babel": {
        "presets": ["one"]
      }
    }
  `
  )

  t.deepEqual(await getBabelConfig(directory), {
    presets: ['one']
  })
})
