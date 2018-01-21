/* @flow */
import type { ChildProcess } from 'child_process'
import { promisify } from 'util'
import * as childProcess from 'child_process'
import * as path from 'path'
import { ensureDir, outputFile } from 'fs-extra'
import tempy from 'tempy'

export const exec = promisify(childProcess.exec)
export { remove } from 'fs-extra'

export async function makeTemporaryDirectory(): Promise<string> {
  const directoryPath = tempy.directory()
  await ensureDir(directoryPath)
  return directoryPath
}

export async function writeFile(...args: Array<string>): Promise<void> {
  const filePath = path.resolve(...args.slice(0, -1))
  const fileContents = args[args.length - 1]
  await outputFile(filePath, fileContents)
}

export async function start(
  command: Array<string>,
  options: { cwd?: string, env?: { [string]: string }, waitForOutput: string }
): Promise<ChildProcess> {
  const child = childProcess.spawn(command[0], command.slice(1), {
    ...options,
    env: { ...process.env, ...options.env },
    detached: true
  })

  await new Promise((resolve, reject) => {
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')

    let error = ''

    child.stderr.on('data', chunk => {
      error += chunk
    })
    child.stdout.on('data', chunk => {
      if (chunk.includes(options.waitForOutput)) {
        resolve()
      }
    })
    child.once('close', code => {
      reject(new Error(`Command exited with code ${code}.\n\n${error}`))
    })
  })

  return child
}

export function stop(child: ChildProcess): Promise<void> {
  process.kill(-child.pid)
  return new Promise(resolve => {
    child.once('close', () => resolve())
  })
}
