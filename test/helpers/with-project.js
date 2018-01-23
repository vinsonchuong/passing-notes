/* @flow */
import test from 'ava'
import * as path from 'path'
import { withDirectory, exec } from './'

export default function(): void {
  withDirectory()

  test.before(async t => {
    await exec('yarn build-esm')
  })

  test.beforeEach(async t => {
    const { directory: projectDirectory } = t.context
    await exec(`yarn add --dev ${path.resolve('dist')}`, {
      cwd: projectDirectory
    })
    Object.assign(t.context, { projectDirectory })
  })
}
