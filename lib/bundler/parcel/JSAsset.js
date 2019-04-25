// @flow
const JSAsset = require('parcel-bundler/src/assets/JSAsset')
const envVisitor = require('parcel-bundler/src/visitors/env')
const getBabelConfig = require('parcel-bundler/src/transforms/babel/config')
const babel6 = require('parcel-bundler/src/transforms/babel/babel6')
const babel7 = require('parcel-bundler/src/transforms/babel/babel7')
const path = require('path')
const presetDiff = require('babel-preset-diff')
const loadSourceMap = require('parcel-bundler/src/utils/loadSourceMap')
const processVisitor = require('parcel-bundler/src/visitors/process')

const NODE_MODULES = `${path.sep}node_modules${path.sep}`
const ENV_RE = /\b(?:process\.env)\b/
const BROWSER_RE = /\b(?:process\.browser)\b/

// `export default` makes Parcel fail without any error output
module.exports = class extends JSAsset {
  async pretransform() {
    if (this.options.sourceMaps && !this.sourceMap) {
      this.sourceMap = await loadSourceMap(this)
    }

    const config = await getBabelConfig(this)

    if (this.name.includes(NODE_MODULES)) {
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
                shippedProposals: true,
                useBuiltIns: 'usage',
                corejs: {
                  // core-js is likely to be installed as a lower version by
                  // some other package. We reference the version that
                  // ultimately gets hoisted
                  version: require('core-js/package.json').version[0],
                  proposals: true
                }
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

    if (this.options.target === 'browser' && BROWSER_RE.test(this.contents)) {
      await this.parseIfNeeded()
      this.traverse(processVisitor)
      this.isAstDirty = true
    }
  }
}

module.exports.path = __filename
