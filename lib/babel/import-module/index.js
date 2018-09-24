/* @flow */
import interopRequire from 'interop-require'

export default function(modulePath: string) {
  require('overdub/register')
  return interopRequire(modulePath)
}
