/* @flow */
import * as childProcess from 'child_process'
import { promisify } from 'util'
import { defineFixture } from 'passing-notes/test/helpers'
import * as withDirectory from 'passing-notes/test/fixtures/with-directory'

const exec = promisify(childProcess.exec)

type Fixture = {
  passingNotes: string,
  directory: string
}

export async function setup(): Promise<Fixture> {
  const passingNotes = await withDirectory.setup()
  await exec(`yarn build-esm ${passingNotes}`)

  const directory = await withDirectory.setup()
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
