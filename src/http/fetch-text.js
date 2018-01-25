/* @flow */
import fetch from 'cross-fetch'

export default async function(url: string): Promise<string> {
  const response = await fetch(url)
  return response.text()
}
