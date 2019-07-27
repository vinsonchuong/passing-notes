/* @flow */
import test from 'ava'
import requireAndCompile from './'
import { withDirectory, withProject } from 'passing-notes/test/fixtures'
import { writeFile, start } from 'passing-notes/test/helpers'

const testWithDirectory = withDirectory(test)
const testWithProject = withProject(test)

function makeLogger() {
  function log(startLog) {
    log.entries.push([startLog])
    return endLog => {
      log.entries.push([startLog, endLog])
    }
  }

  log.entries = []

  return log
}

testWithProject('compiling a module', async t => {
  const { project } = t.context
  await writeFile(
    project,
    'run.js',
    `
    try {
      const path = require('path')
      const { requireAndCompile } = require('passing-notes/lib/require')
      const { printLog } = require('passing-notes/lib/log')
      const { add } = requireAndCompile({
        modulePath: path.resolve('lib.js'),
        log: printLog
      })
      console.log(add(21, 21))
    } catch (error) {
      console.log(error)
    }
    console.log('Done')
    `
  )
  await writeFile(
    project,
    'lib.js',
    `
    export function add(x: number, y: number): number {
      return x + y
    }
    `
  )

  const { stdout } = await start(['node', 'run.js'], {
    cwd: project,
    waitForOutput: 'Done'
  })
  t.true(stdout.includes('42'))
})

testWithDirectory('importing a module', async t => {
  const { directory } = t.context
  await writeFile(
    directory,
    'index.js',
    `
    export const number = 42

    export function add(x, y) {
      return x + y
    }
    `
  )

  type Module = {
    number: number,
    add: (number, number) => number
  }
  const log = makeLogger()

  const importedModule = requireAndCompile<Module>({
    modulePath: directory,
    log
  })
  t.is(importedModule && importedModule.number, 42)
  t.is(importedModule && importedModule.add(1, 2), 3)
  t.deepEqual(log.entries, [
    [{ type: 'CLI', message: 'Compiling API...' }],
    [
      { type: 'CLI', message: 'Compiling API...' },
      { type: 'CLI', message: 'Finished' }
    ]
  ])
})

testWithDirectory('returning null on compilation error', async t => {
  const { directory } = t.context
  await writeFile(
    directory,
    'index.js',
    `
    expart const number = 42
    `
  )

  const log = makeLogger()

  const importedModule = requireAndCompile<{ number: number }>({
    modulePath: directory,
    log
  })
  t.is(importedModule, null)
  t.deepEqual(log.entries[0], [{ type: 'CLI', message: 'Compiling API...' }])
  t.true(log.entries[1][1].error instanceof SyntaxError)
})
