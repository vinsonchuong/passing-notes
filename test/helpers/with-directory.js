/* @flow */
import test from 'ava'
import { makeTemporaryDirectory, remove } from './'

export default function(): void {
  test.beforeEach(async t => {
    const directory = await makeTemporaryDirectory()
    Object.assign(t.context, { directory })
  })

  test.afterEach.always(async t => {
    const { directory } = t.context
    await remove(directory)
  })
}
