/* @flow */
import type { BabelConfig } from 'passing-notes/lib/babel'
import { defaultBabelConfig, getUserBabelConfig } from 'passing-notes/lib/babel'

export default async function(rootDir: string): Promise<BabelConfig> {
  const userBabelConfig = await getUserBabelConfig(rootDir)
  return {
    ...defaultBabelConfig,
    ...userBabelConfig
  }
}
