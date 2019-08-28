/* @flow */
import * as path from 'path'
import { rollup } from 'rollup'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import filenamify from 'filenamify'

export default async function(entry: string): Promise<void> {
  const bundle = await rollup({
    input: entry,
    plugins: [resolve(), commonjs({ include: /node_modules/ })]
  })

  await bundle.write({
    file: path.resolve('dist', filenamify(entry), 'index.js'),
    format: 'cjs'
  })
}
