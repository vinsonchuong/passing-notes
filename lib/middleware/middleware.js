/* @flow */
import type { Responder } from 'passing-notes/lib/http'

export type Middleware = Responder => Responder
