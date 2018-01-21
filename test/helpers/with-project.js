/* @flow */
import test from 'ava'
import * as path from 'path'
import { exec, makeTemporaryDirectory, remove } from './'

export default function(): void {
  test.before(async t => {
    await exec('yarn build-esm')
  })

  test.beforeEach(async t => {
    const projectDirectory = await makeTemporaryDirectory()
    await exec(`yarn add --dev ${path.resolve('dist')}`, {
      cwd: projectDirectory
    })
    Object.assign(t.context, { projectDirectory })
  })

  test.afterEach.always(async t => {
    const { projectDirectory } = t.context
    await remove(projectDirectory)
  })
}
