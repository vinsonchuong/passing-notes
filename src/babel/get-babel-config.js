/* @flow */
import * as path from 'path'
import { pathExists, readJson } from 'fs-extra'

type BabelConfig = {
  presets?: Array<string>,
  plugins?: Array<string>
}

export default async function(): Promise<?BabelConfig> {
  const packageJson = await readJson(path.resolve('package.json'))
  if ('babel' in packageJson) {
    return packageJson.babel
  } else if (await pathExists(path.resolve('.babelrc'))) {
    return readJson(path.resolve('.babelrc'))
  } else if (await pathExists(path.resolve('.babelrc.js'))) {
    // $FlowFixMe
    return require(path.resolve('.babelrc.js'))
  } else {
    return null
  }
}
