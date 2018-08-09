/* @flow */
import type { TestInterface } from 'ava'
import tempy from 'tempy'
import { ensureDir, remove } from 'fs-extra'

export default function<Context>(
  test: TestInterface<Context>
): TestInterface<Context & { directory: string }> {
  const newTest: TestInterface<Context & { directory: string }> = (test: any)

  newTest.beforeEach(async t => {
    const directory = tempy.directory()
    await ensureDir(directory)
    Object.assign(t.context, { directory })
  })

  newTest.afterEach.always(async t => {
    const { directory } = t.context
    await remove(directory)
  })

  return newTest
}
