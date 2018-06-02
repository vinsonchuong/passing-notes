/* @flow */
import { liftResponder } from 'passing-notes/lib/http'
import {
  combine,
  compressBody,
  serializeJson,
  setContentLength,
  addAuthorityToUrl
} from 'passing-notes/lib/middleware'

export default combine([
  addAuthorityToUrl,
  serializeJson,
  compressBody,
  setContentLength,
  liftResponder
])
