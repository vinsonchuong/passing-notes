/* @flow */
import * as path from 'path'
import JSAsset from 'parcel-bundler/src/assets/JSAsset'
import { getBabelConfig } from 'passing-notes/lib/babel'

// `export default` makes Parcel fail without any error output
module.exports = class extends JSAsset {
  static path = __filename

  async pretransform() {
    await this.getPackage()
    const pkgfile = Array.from(this.dependencies.keys()).find(file =>
      file.endsWith('package.json')
    )

    if (!this.isNodeModule() && pkgfile) {
      const rootDir = path.dirname(pkgfile)
      this.babelConfig = await getBabelConfig(rootDir)
    }
    await Reflect.apply(JSAsset.prototype.pretransform, this, [])
  }

  isNodeModule() {
    return this.name.includes(`${path.sep}node_modules${path.sep}`)
  }
}
