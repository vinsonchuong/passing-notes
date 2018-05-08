/* @flow */
import type { Request, Response } from 'passing-notes/lib/http'

export type Responder = Request => Response | Promise<Response>
