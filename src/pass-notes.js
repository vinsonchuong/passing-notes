/* @flow */
/* eslint-disable */
export default function(...features: any): any {
  return async (request, response) => {
    for (const feature of features) {
      await new Promise(resolve => feature(request, response, resolve))
    }
  }
}
