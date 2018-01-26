/* @flow */
import type { Feature } from 'passing-notes'

export default function(...features: Array<Feature>): Feature {
  return async (request, response) => {
    for (const feature of features) {
      await new Promise(resolve => feature(request, response, resolve))
    }
  }
}
