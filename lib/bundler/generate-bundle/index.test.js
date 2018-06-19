/* @flow */
import test from 'ava'
import td from 'testdouble'
import * as path from 'path'
import { withDirectory } from 'passing-notes/test/fixtures'
import { listDirectory, writeFile } from 'passing-notes/test/helpers'
import { generateBundle } from 'passing-notes/lib/bundler'

const htmlFixturePath = path.join(
  __dirname,
  '..',
  'test',
  'fixtures',
  'index.html'
)

withDirectory({ key: 'inputDirectory', perTest: true })
withDirectory({ key: 'outputDirectory', perTest: true })

test('generating a bundle from the entry point into the output directory', async t => {
  const { outputDirectory } = t.context

  await generateBundle({
    entry: htmlFixturePath,
    outputDirectory,
    log: () => {}
  })

  const bundleFiles = await listDirectory(outputDirectory)
  t.regex(bundleFiles[0], /fixtures\.[a-z0-9]{8}\.js/)
  t.regex(bundleFiles[1], /fixtures\.[a-z0-9]{8}\.map/)
  t.is(bundleFiles[2], 'index.html')
})

test('not needlessly regenerating the bundle when called multiple times', async t => {
  const { outputDirectory } = t.context

  const firstGenerateDuration = await time(async () => {
    await generateBundle({
      entry: htmlFixturePath,
      outputDirectory,
      log: () => {}
    })
  })

  const nextGenerateDuration = await time(async () => {
    await generateBundle({
      entry: htmlFixturePath,
      outputDirectory,
      log: () => {}
    })
  })

  t.true(firstGenerateDuration > 1000)
  t.true(nextGenerateDuration < 100)
})

test('logging compilation start and finish', async t => {
  const { inputDirectory, outputDirectory } = t.context
  const log = td.func()

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

  td.verify(
    log(td.matchers.contains({ type: 'UI', message: 'Compiling UI...' })),
    { times: 1 }
  )
  td.verify(
    log(
      td.matchers.contains({ type: 'UI', message: 'Compiling UI...' }),
      td.matchers.contains({ type: 'UI', message: 'Finished' })
    ),
    { times: 1 }
  )

  await writeFile(
    inputDirectory,
    'index.html',
    `
    <!doctype html>
    <meta charset="utf-8">
    <div>Pong</div>
    `
  )

  await new Promise(resolve => setTimeout(resolve, 1000))

  td.verify(
    log(td.matchers.contains({ type: 'UI', message: 'Compiling UI...' })),
    { times: 2 }
  )
  td.verify(
    log(
      td.matchers.contains({ type: 'UI', message: 'Compiling UI...' }),
      td.matchers.contains({ type: 'UI', message: 'Finished' })
    ),
    { times: 2 }
  )

  t.pass()
})

test('logging compilation errors', async t => {
  const { inputDirectory, outputDirectory } = t.context

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
    log: (start, finish) => {
      if (finish && finish.error) {
        const errorMessage = finish.error.message
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
