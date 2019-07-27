/* @flow */
import test from 'ava'
import { promisify } from 'util'
import hotRequireAndCompile from './'
import { withDirectory } from 'passing-notes/test/fixtures'
import { writeFile } from 'passing-notes/test/helpers'

const sleep = promisify(setTimeout)
const testWithDirectory = withDirectory(test)

testWithDirectory('reloading modules when they change', async t => {
  const { directory } = t.context
  await writeFile(
    directory,
    'number.js',
    `
    export const number = 42
    `
  )
  await writeFile(
    directory,
    'index.js',
    `
    export { number } from './number'
    `
  )

  const mod = hotRequireAndCompile<{ number: number }>({
    baseDirectory: directory,
    modulePath: directory,
    log: () => () => {}
  })
  t.is(mod.number, 42)

  await sleep(200)
  await writeFile(
    directory,
    'number.js',
    `
    export const number = 43
    `
  )
  await sleep(200)
  t.is(mod.number, 43)

  await sleep(200)
  await writeFile(
    directory,
    'index.js',
    `
    export const number = 21
    `
  )
  await sleep(200)
  t.is(mod.number, 21)
})
