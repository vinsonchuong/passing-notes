/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import { generateBundle } from 'passing-notes/lib/bundler'
import { combine, serveStatic } from 'passing-notes/lib/middleware'
import * as path from 'path'
import filenamify from 'filenamify'

export default function(entryPoint: string): Responder => Responder {
  const outputDirectory = path.join('dist', filenamify(entryPoint))

  return combine(
    waitForBundle(entryPoint, outputDirectory),
    serveStatic(outputDirectory)
  )
}

function waitForBundle(
  entryPoint: string,
  outputDirectory: string
): Responder => Responder {
  generateBundle(entryPoint, outputDirectory)
  return next => async request => {
    await generateBundle(entryPoint, outputDirectory)
    return next(request)
  }
}
