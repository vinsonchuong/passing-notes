/* @flow */
import { flow } from 'lodash'
import liftRequest from './lift-request'
import removeHttpSpecificHeaders from './remove-http-specific-headers'

export default flow([removeHttpSpecificHeaders])(liftRequest)

export { default as liftRequest } from './lift-request'
export {
  default as removeHttpSpecificHeaders
} from './remove-http-specific-headers'
