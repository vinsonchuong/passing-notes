/* @flow */
import type { Responder, Response } from 'passing-notes/lib/http'

export default function(response: Response): Responder => Responder {
  return next => async () => response
}
