/* @flow */
export default function(modulePath: string) {
  require('overdub/register')

  // $FlowFixMe
  return require(modulePath)
}
