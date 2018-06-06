/* @flow */
import type { Fixture as DirectoryFixture } from 'passing-notes/test/fixtures/with-directory'
import * as childProcess from 'child_process'
import * as path from 'path'
import { promisify } from 'util'
import { copy } from 'fs-extra'
import { defineFixture } from 'passing-notes/test/helpers'
import * as withDirectory from 'passing-notes/test/fixtures/with-directory'

const exec = promisify(childProcess.exec)

type Params = {
  fixtureName: string
}

export type Fixture = {
  passingNotes: DirectoryFixture,
  directory: DirectoryFixture
}

export async function setup({ fixtureName }: Params): Promise<Fixture> {
  const passingNotes = await withDirectory.setup()
  await exec(`yarn build-esm ${passingNotes}`)

  const directory = await withDirectory.setup()
  await copy(path.resolve('examples', fixtureName), directory)
  await exec(`yarn add --dev ${passingNotes}`, {
    cwd: directory
  })

  return { passingNotes, directory }
}

export async function teardown({
  passingNotes,
  directory
}: Fixture): Promise<void> {
  await withDirectory.teardown(passingNotes)
  await withDirectory.teardown(directory)
}

export default defineFixture({ setup, teardown })
