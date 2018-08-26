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
    if (error.stderr.includes('ENOENT: no such file or directory, scandir')) {
      await sleep(500)
      await install(packageName, projectDirectory)
    } else {
      throw error
    }
  }
}
