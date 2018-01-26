/* @flow */
import type { Feature } from 'passing-notes'
import Bundler from 'parcel-bundler'

export default function(entryPoint: string): Feature {
  const bundler = new Bundler(entryPoint)
  return bundler.middleware()
}
