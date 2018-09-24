/* eslint-disable flowtype/no-weak-types */
/* @flow */
import type { TestInterface } from 'ava'
import tempy from 'tempy'
import { ensureDir, remove } from 'fs-extra'

export default function<Context: {}>(
  test: TestInterface<Context>
): TestInterface<{ ...$Exact<Context>, directory: string }> {
  const testWithDirectory: TestInterface<{
    ...$Exact<Context>,
    directory: string
  }> = (test: any)

  testWithDirectory.beforeEach(async t => {
    t.context.directory = tempy.directory()
    await ensureDir(t.context.directory)
  })

  testWithDirectory.afterEach.always(async t => {
    await remove(t.context.directory)
  })

  return testWithDirectory
}
