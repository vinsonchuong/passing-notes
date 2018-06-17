/* @flow */
import * as path from 'path'
import { outputFile, readdir } from 'fs-extra'

export async function writeFile(...args: Array<string>): Promise<string> {
  const filePath = path.resolve(...args.slice(0, -1))
  const fileContents = args[args.length - 1]
  await outputFile(filePath, fileContents)
  return filePath
}

export async function listDirectory(
  ...paths: Array<string>
): Promise<Array<string>> {
  return readdir(path.join(...paths))
}
