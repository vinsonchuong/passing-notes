/* @flow */
import type { Fixture as ProjectFixture } from 'passing-notes/test/fixtures/with-project'
import * as withProject from 'passing-notes/test/fixtures/with-project'
import { defineFixture } from 'passing-notes/test/helpers'
import * as path from 'path'
import { copy } from 'fs-extra'

type Params = {
  fixtureName: string
}

export async function setup({ fixtureName }: Params): Promise<ProjectFixture> {
  const project = await withProject.setup()
  await copy(path.resolve('examples', fixtureName), project.directory)
  return project
}

export async function teardown(project: ProjectFixture): Promise<void> {
  await withProject.teardown(project)
}

export default defineFixture({ setup, teardown })
