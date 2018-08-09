/* @flow */
import ava from 'ava'
import { flow } from 'lodash'
import { writeFile } from 'passing-notes/test/helpers'
import { withDirectory } from 'passing-notes/test/fixtures'
import { getBabelConfig } from 'passing-notes/lib/babel'

const test = flow(withDirectory)(ava)

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
