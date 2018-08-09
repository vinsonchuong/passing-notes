/* @flow */
import interopRequire from 'interop-require'

export default function(babelConfig: {}, modulePath: string) {
  require('@babel/register')(babelConfig)
  return interopRequire(modulePath)
}
