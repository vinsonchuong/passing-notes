import flowRight from 'lodash/flowRight.js'

export default function compose(...middlewares) {
  return flowRight(...middlewares)(() => {
    throw new Error('Unhandled Request')
  })
}
