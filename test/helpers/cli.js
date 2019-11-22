/* @flow */
import type { ChildProcess } from 'child_process'
import * as childProcess from 'child_process'

type SpawnedProcess = {
  process: ChildProcess,
  stdout: string,
  stderr: string
}

export async function start(
  command: Array<string>,
  options: { cwd?: string, env?: { [string]: string }, waitForOutput: string }
): Promise<SpawnedProcess> {
  const spawned = {
    process: childProcess.spawn(command[0], command.slice(1), {
      ...options,
      // $FlowFixMe
      env: { ...process.env, ...options.env },
      detached: true
    }),
    stdout: '',
    stderr: ''
  }

  await new Promise((resolve, reject) => {
    spawned.process.stdout.setEncoding('utf8')
    spawned.process.stderr.setEncoding('utf8')

    spawned.process.stderr.on('data', chunk => {
      spawned.stderr += chunk
    })
    spawned.process.stdout.on('data', chunk => {
      spawned.stdout += chunk
      if (chunk.includes(options.waitForOutput)) {
        resolve()
      }
    })
    spawned.process.once('close', code => {
      reject(
        new Error(
          `Command exited with code ${code}\n\nSTDOUT:\n${spawned.stdout}\n\nSTDERR:\n${spawned.stderr}`
        )
      )
    })
  })

  return spawned
}

export function stop(spawned: SpawnedProcess): Promise<void> {
  process.kill(-spawned.process.pid)
  return new Promise(resolve => {
    spawned.process.once('close', () => resolve())
  })
}
