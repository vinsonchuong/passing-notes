/* @flow */
import { defineFixture } from 'passing-notes/test/helpers'
import tempy from 'tempy'
import { ensureDir, remove } from 'fs-extra'

export default defineFixture({
  async setup(): Promise<string> {
    const directoryPath = tempy.directory()
    await ensureDir(directoryPath)
    return directoryPath
  },

  teardown: remove
})
