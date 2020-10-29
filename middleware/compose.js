import flowRight from 'lodash/flowRight.js'

export default function (...middlewares) {
  return flowRight(...middlewares)(() => {
    throw new Error('Unhandled Request')
  })
}
