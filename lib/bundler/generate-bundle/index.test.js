/* @flow */
import test from 'ava'
import * as path from 'path'
import { withDirectory } from 'passing-notes/test/fixtures'
import { listDirectory } from 'passing-notes/test/helpers'
import { generateBundle } from 'passing-notes/lib/bundler'

const htmlFixturePath = path.join(
  __dirname,
  '..',
  'test',
  'fixtures',
  'index.html'
)

withDirectory({ key: 'outputDirectory', perTest: true })

test('generating a bundle from the entry point into the output directory', async t => {
  const { outputDirectory } = t.context

  await generateBundle(htmlFixturePath, outputDirectory)

  const bundleFiles = await listDirectory(outputDirectory)
  t.regex(bundleFiles[0], /fixtures\.[a-z0-9]{8}\.js/)
  t.regex(bundleFiles[1], /fixtures\.[a-z0-9]{8}\.map/)
  t.is(bundleFiles[2], 'index.html')
})

test('not needlessly regenerating the bundle when called multiple times', async t => {
  const { outputDirectory } = t.context

  const firstGenerateDuration = await time(async () => {
    await generateBundle(htmlFixturePath, outputDirectory)
  })

  const nextGenerateDuration = await time(async () => {
    await generateBundle(htmlFixturePath, outputDirectory)
  })

  t.true(firstGenerateDuration > 1000)
  t.true(nextGenerateDuration < 100)
})

async function time(doWork) {
  const startTime = process.hrtime()
  await doWork()
  const duration = process.hrtime(startTime)
  return duration[0] * 1000 + duration[1] / 1e6
}
