import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import cjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'

export default {
  entry: 'src/boundobject.js',
  format: 'iife',
  moduleName: 'BoundObject',
  plugins: [
    buble(),
    resolve(),
    cjs(),
    uglify()
  ],
  dest: 'dist/boundobject.min.js'
}
