/* @flow */
import { defineFixture } from 'passing-notes/test/helpers'
import tempy from 'tempy'
import { ensureDir, remove } from 'fs-extra'

type Fixture = string

export async function setup(): Promise<Fixture> {
  const directoryPath = tempy.directory()
  await ensureDir(directoryPath)
  return directoryPath
}

export const teardown = remove

export default defineFixture({ setup, teardown })
