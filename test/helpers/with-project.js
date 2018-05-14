/* @flow */
import test from 'ava'
import { withDirectory } from 'passing-notes/test/fixtures'
import { exec } from './'

export default function(): void {
  withDirectory({ perTest: false, key: 'compiledPassingNotesPath' })
  withDirectory({ perTest: true, key: 'projectDirectory' })

  test.before(async () => {
    const { compiledPassingNotesPath } = global
    await exec(`yarn build-esm ${compiledPassingNotesPath}`)
  })

  test.beforeEach(async t => {
    const { compiledPassingNotesPath } = global
    const { projectDirectory } = t.context
    await exec(`yarn add --dev ${compiledPassingNotesPath}`, {
      cwd: projectDirectory
    })
  })
}
