/* @flow */
import { flow } from 'lodash'
import liftResponder from './lift-responder'
import addAuthorityToUrl from './add-authority-to-url'
import compressBody from './compress-body'
import serializeJson from './serialize-json'
import setContentLength from './set-content-length'

export default flow([
  addAuthorityToUrl,
  serializeJson,
  compressBody,
  setContentLength,
  liftResponder
])

export { default as liftResponder } from './lift-responder'

export { default as addAuthorityToUrl } from './add-authority-to-url'
export { default as compressBody } from './compress-body'
export { default as serializeJson } from './serialize-json'
export { default as setContentLength } from './set-content-length'
