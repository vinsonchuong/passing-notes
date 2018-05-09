/* @flow */
import { flow } from 'lodash'
import { liftResponder } from 'passing-notes/lib/http'
import {
  addAuthorityToUrl,
  compressBody,
  serializeJson,
  setContentLength
} from 'passing-notes/lib/middleware/server'

export default flow([
  addAuthorityToUrl,
  serializeJson,
  compressBody,
  setContentLength,
  liftResponder
])
