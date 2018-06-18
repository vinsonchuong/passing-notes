/* @flow */
import PrettyError from 'pretty-error'

const prettyError = new PrettyError()
prettyError.skip(traceLine => {
  return traceLine.packageName !== '[current]'
})
prettyError.skipNodeFiles()
prettyError.withoutColors()

export default function(error: Error) {
  return prettyError.render(error)
}
