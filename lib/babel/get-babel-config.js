/* @flow */
import type { BabelConfig } from './'
import { defaultBabelConfig, getUserBabelConfig } from './'

export default async function(rootDir: string): Promise<BabelConfig> {
  const userBabelConfig = await getUserBabelConfig(rootDir)
  return {
    ...defaultBabelConfig,
    ...userBabelConfig
  }
}
