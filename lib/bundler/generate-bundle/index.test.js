/* @flow */
import test from 'ava'
import * as path from 'path'
import { promisify } from 'util'
import { withDirectory } from 'passing-notes/test/fixtures'
import { listDirectory, writeFile } from 'passing-notes/test/helpers'
import { generateBundle } from 'passing-notes/lib/bundler'

const sleep = promisify(setTimeout)

const htmlFixturePath = path.join(
  __dirname,
  '..',
  'test',
  'fixtures',
  'index.html'
)

const testWithDirectory = withDirectory(test)

testWithDirectory.serial(
  'generating a bundle from the entry point into the output directory',
  async t => {
    const { directory } = t.context
    const outputDirectory = path.join(directory, 'output')

    const logs = []
    await generateBundle({
      entry: htmlFixturePath,
      outputDirectory,
      log: startEntry => {
        logs.push([startEntry])
        return endEntry => {
          logs.push([startEntry, endEntry])
        }
      }
    })

    try {
      const bundleFiles = await listDirectory(outputDirectory)
      t.log(bundleFiles)
      t.regex(bundleFiles[0], /fixtures\.[a-z0-9]{8}\.js/)
      t.regex(bundleFiles[1], /fixtures\.[a-z0-9]{8}\.js.map/)
      t.is(bundleFiles[2], 'index.html')
    } catch (error) {
      t.log(logs)
      throw error
    }
  }
)

testWithDirectory.serial(
  'not needlessly regenerating the bundle when called multiple times',
  async t => {
    const { directory } = t.context
    const outputDirectory = path.join(directory, 'output')

    const firstGenerateDuration = await time(async () => {
      await generateBundle({
        entry: htmlFixturePath,
        outputDirectory,
        log: () => () => {}
      })
    })

    const nextGenerateDuration = await time(async () => {
      await generateBundle({
        entry: htmlFixturePath,
        outputDirectory,
        log: () => () => {}
      })
    })

    t.true(nextGenerateDuration / firstGenerateDuration < 0.8)
  }
)

testWithDirectory.serial('logging compilation start and finish', async t => {
  const { directory } = t.context
  const inputDirectory = path.join(directory, 'input')
  const outputDirectory = path.join(directory, 'output')

  const logs = []
  const log = startEntry => {
    logs.push([startEntry])
    return endEntry => {
      logs.push([startEntry, endEntry])
    }
  }

  await writeFile(inputDirectory, 'package.json', `{}`)

  await writeFile(
    inputDirectory,
    'index.html',
    `
    <!doctype html>
    <meta charset="utf-8">
    <div>Ping</div>
    `
  )

  await generateBundle({
    entry: path.join(inputDirectory, 'index.html'),
    outputDirectory,
    log
  })

  t.deepEqual(logs, [
    [{ type: 'UI', message: 'Compiling UI...' }],
    [{ type: 'UI', message: 'Compiling UI...' }, { message: 'Finished' }]
  ])

  await sleep(1000)
  await writeFile(
    inputDirectory,
    'index.html',
    `
    <!doctype html>
    <meta charset="utf-8">
    <div>Pong</div>
    `
  )
  await sleep(1000)

  t.deepEqual(logs, [
    [{ type: 'UI', message: 'Compiling UI...' }],
    [{ type: 'UI', message: 'Compiling UI...' }, { message: 'Finished' }],
    [{ type: 'UI', message: 'Compiling UI...' }],
    [{ type: 'UI', message: 'Compiling UI...' }, { message: 'Finished' }]
  ])
})

testWithDirectory.serial('logging compilation errors', async t => {
  const { directory } = t.context
  const inputDirectory = path.join(directory, 'input')
  const outputDirectory = path.join(directory, 'output')

  await writeFile(inputDirectory, 'package.json', `{}`)

  await writeFile(
    inputDirectory,
    'index.html',
    `
    <!doctype html>
    <meta charset="utf-8">
    <script async src="index.js"></script>
    `
  )

  await writeFile(
    inputDirectory,
    'index.js',
    `
    impor something from './missing-file'
    `
  )

  t.plan(2)
  await generateBundle({
    entry: path.join(inputDirectory, 'index.html'),
    outputDirectory,
    log: startEntry => endEntry => {
      if (endEntry.error) {
        const errorMessage = endEntry.error.message
        t.regex(errorMessage, /Unexpected token/)
        t.regex(errorMessage, /impor something/)
      }
    }
  })
})

async function time(doWork) {
  const startTime = process.hrtime()
  await doWork()
  const duration = process.hrtime(startTime)
  return duration[0] * 1000 + duration[1] / 1e6
}
