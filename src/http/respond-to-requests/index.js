/* @flow */
import { flow } from 'lodash'
import { liftResponder } from 'passing-notes/lib/http'
import {
  compressBody,
  serializeJson,
  setContentLength,
  addAuthorityToUrl
} from 'passing-notes/lib/middleware'

export default flow([
  addAuthorityToUrl,
  serializeJson,
  compressBody,
  setContentLength,
  liftResponder
])
