/* @flow */
import * as path from 'path'
import { pathExists, readJson } from 'fs-extra'
import type { BabelConfig } from './'

export default async function(rootDir: string): Promise<?BabelConfig> {
  const packageJson = await readJson(path.resolve(rootDir, 'package.json'))
  if ('babel' in packageJson) {
    return packageJson.babel
  } else if (await pathExists(path.resolve(rootDir, '.babelrc'))) {
    return readJson(path.resolve(rootDir, '.babelrc'))
  } else if (await pathExists(path.resolve(rootDir, '.babelrc.js'))) {
    // $FlowFixMe
    return require(path.resolve(rootDir, '.babelrc.js'))
  } else {
    return null
  }
}
