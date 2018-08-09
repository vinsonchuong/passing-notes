/* @flow */
import type { TestInterface } from 'ava'
import * as childProcess from 'child_process'
import * as path from 'path'
import { promisify } from 'util'
import tempy from 'tempy'
import { ensureDir, remove, copy } from 'fs-extra'

const exec = promisify(childProcess.exec)

export default function({ fixtureName }: { fixtureName: string }) {
  return function<Context>(
    test: TestInterface<Context>
  ): TestInterface<Context & { project: { passingNotes: string, directory: string } }> {
    const newTest: TestInterface<Context & { project: { passingNotes: string, directory: string } }> = (test: any)

    newTest.beforeEach(async t => {
      const passingNotes = tempy.directory()
      await ensureDir(passingNotes)
      await exec(`yarn build-esm ${passingNotes}`)

      const directory = await tempy.directory()
      await ensureDir(directory)
      await copy(path.resolve('examples', fixtureName), directory)
      await exec(`yarn add --dev ${passingNotes}`, { cwd: directory })

      Object.assign(t.context, { project: { passingNotes, directory } })
    })

    newTest.afterEach.always(async t => {
      const { project: { passingNotes, directory } } = t.context
      await remove(directory)
      await remove(passingNotes)
    })

    return newTest
  }
}
