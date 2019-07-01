import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [{
  input: 'src/webnode.js',
  output: {
    file: './webnode.js',
    format: 'cjs',
    plugins: [
      resolve({preferBuiltins: true, mainFields: ['module', 'jsnext', 'main', 'browser']}),
      commonjs({ include: 'node_modules/**'})
    ]
  }
}]