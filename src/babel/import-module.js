/* @flow */
import interopRequire from 'interop-require'

export default function(babelConfig: {}, modulePath: string) {
  require('babel-register')(babelConfig)

  Object.keys(require.cache)
    .filter(modulePath => !modulePath.includes('node_modules'))
    .forEach(modulePath => Reflect.deleteProperty(require.cache, modulePath))

  return interopRequire(modulePath)
}
