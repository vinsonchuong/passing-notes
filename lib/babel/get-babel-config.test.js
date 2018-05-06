/* @flow */
import test from 'ava'
import { withDirectory, writeFile } from 'passing-notes/test/helpers'
import { getBabelConfig } from 'passing-notes/lib/babel'

withDirectory()

test.serial('preferring package.json', async t => {
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

  await writeFile(
    directory,
    '.babelrc',
    `
    {
      "presets": ["two"]
    }
  `
  )

  t.deepEqual(await getBabelConfig(directory), {
    presets: ['one']
  })
})

test.serial('reading .babelrc', async t => {
  const { directory } = t.context

  await writeFile(directory, 'package.json', '{}')

  await writeFile(
    directory,
    '.babelrc',
    `
    {
      "presets": ["one"]
    }
  `
  )

  t.deepEqual(await getBabelConfig(directory), {
    presets: ['one']
  })
})

test.serial('reading .babelrc.js', async t => {
  const { directory } = t.context

  await writeFile(directory, 'package.json', '{}')

  await writeFile(
    directory,
    '.babelrc.js',
    `
    module.exports = {
      presets: ['one']
    }
  `
  )

  t.deepEqual(await getBabelConfig(directory), {
    presets: ['one']
  })
})
