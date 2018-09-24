/* @flow */
import JSAsset from 'parcel-bundler/src/assets/JSAsset'
import envVisitor from 'parcel-bundler/src/visitors/env'
import getBabelConfig from 'parcel-bundler/src/transforms/babel/config'
import babel6 from 'parcel-bundler/src/transforms/babel/babel6'
import babel7 from 'parcel-bundler/src/transforms/babel/babel7'
import * as path from 'path'
import presetDiff from 'babel-preset-diff'
import * as babelParser from '@babel/parser'

const NODE_MODULES = `${path.sep}node_modules${path.sep}`
const ENV_RE = /\b(?:process\.env)\b/

// `export default` makes Parcel fail without any error output
module.exports = class extends JSAsset {
  parse(code: string) {
    return babelParser.parse(code, {
      filename: this.name,
      allowReturnOutsideFunction: true,
      strictMode: false,
      sourceType: 'module',
      plugins: [
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'dynamicImport',

        // Pending PR babel/babel#8448
        'objectRestSpread',
        'asyncGenerators',
        'optionalCatchBinding',
        'jsonStrings'
      ]
    })
  }

  async pretransform() {
    await this.loadSourceMap()

    if (this.name.includes(NODE_MODULES)) {
      const config = await getBabelConfig(this)
      if (config[6]) await babel6(this, config[6])
      if (config[7]) await babel7(this, config[7])
    } else {
      await babel7(this, {
        internal: true,
        babelVersion: 7,
        config: {
          presets: [
            [
              presetDiff,
              {
                modules: false,
                shippedProposals: true
              }
            ]
          ]
        }
      })
    }

    if (this.options.target === 'browser' && ENV_RE.test(this.contents)) {
      await this.parseIfNeeded()
      this.traverseFast(envVisitor)
    }
  }
}

module.exports.path = __filename
