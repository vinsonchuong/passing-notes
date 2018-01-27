/* @flow */
import type { Feature } from 'passing-notes'
import Bundler from 'parcel-bundler'

export default function(entryPoint: string): Feature {
  const bundler = new Bundler(entryPoint, {
    logLevel: process.env.NODE_ENV === 'test' ? 1 : 3
  })
  return bundler.middleware()
}
