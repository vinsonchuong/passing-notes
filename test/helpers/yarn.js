/* @flow */
import * as childProcess from 'child_process'
import { promisify } from 'util'

const exec = promisify(childProcess.exec)
const sleep = promisify(setTimeout)

export async function install(packageName: string, projectDirectory: string) {
  try {
    await exec(`yarn add --dev ${packageName}`, {
      cwd: projectDirectory
    })
  } catch (error) {
    if (error.stderr.includes('ENOENT') || error.stderr.includes('EEXIST')) {
      await sleep(500)
      await install(packageName, projectDirectory)
    } else {
      throw error
    }
  }
}
