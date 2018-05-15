/* @flow */
import * as childProcess from 'child_process'
import { promisify } from 'util'
import { defineFixture } from 'passing-notes/test/helpers'
import * as withDirectory from 'passing-notes/test/fixtures/with-directory'

const exec = promisify(childProcess.exec)

type Fixture = {
  passingNotesDirectory: string,
  projectDirectory: string
}

export async function setup(): Promise<Fixture> {
  const passingNotesDirectory = await withDirectory.setup()
  await exec(`yarn build-esm ${passingNotesDirectory}`)

  const projectDirectory = await withDirectory.setup()
  await exec(`yarn add --dev ${passingNotesDirectory}`, {
    cwd: projectDirectory
  })

  return { passingNotesDirectory, projectDirectory }
}

export async function teardown({
  passingNotesDirectory,
  projectDirectory
}: Fixture): Promise<void> {
  await withDirectory.teardown(passingNotesDirectory)
  await withDirectory.teardown(projectDirectory)
}

export default defineFixture({ setup, teardown })
