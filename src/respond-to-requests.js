/* @flow */
import { flow } from 'lodash'
import { liftResponder } from 'passing-notes/src/http'
import {
  addAuthorityToUrl,
  compressBody,
  serializeJson,
  setContentLength
} from 'passing-notes/src/middleware'

export default flow([
  addAuthorityToUrl,
  serializeJson,
  compressBody,
  setContentLength,
  liftResponder
])
