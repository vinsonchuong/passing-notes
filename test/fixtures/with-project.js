/* eslint-disable flowtype/no-weak-types */
/* @flow */
import type { TestInterface } from 'ava'
import * as childProcess from 'child_process'
import { promisify } from 'util'
import { install } from 'passing-notes/test/helpers'
import tempy from 'tempy'
import { ensureDir, remove } from 'fs-extra'

const exec = promisify(childProcess.exec)

export default function<Context: {}>(
  test: TestInterface<Context>
): TestInterface<{
  ...$Exact<Context>,
  project: string,
  passingNotes: string
}> {
  const testWithProject: TestInterface<{
    ...$Exact<Context>,
    project: string,
    passingNotes: string
  }> = (test: any)

  testWithProject.beforeEach(async t => {
    const project = tempy.directory()
    const passingNotes = tempy.directory()
    Object.assign(t.context, { project, passingNotes })

    await ensureDir(project)
    await ensureDir(passingNotes)

    await exec(`yarn build-esm ${passingNotes}`)
    await install(passingNotes, project)
  })

  testWithProject.afterEach.always(async t => {
    await remove(t.context.project)
    await remove(t.context.passingNotes)
  })

  return testWithProject
}
