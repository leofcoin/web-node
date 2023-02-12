import typescript from '@rollup/plugin-typescript'
import tsConfig from './tsconfig.json' assert { type: 'json'}
import { readdir } from 'fs/promises'
import { join } from 'path'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import modify from 'rollup-plugin-modify'
import json from '@rollup/plugin-json'
import { execSync } from 'child_process'
let views = (await readdir('./src/views')).map(path => join('./src/views', path))
views = [...views, ...(await readdir('./src/views/explorer')).map(path => join('./src/views/explorer', path))]
console.log(views);


// const templates = (await readdir('./src/templates')).map(path => join('./src/templates', path))
const clean = () => {
  execSync('rm -rf www/*.js')
  return
}

export default [{
  input: ['./src/shell.js', ...views, './node_modules/@leofcoin/storage/exports/browser-store.js'],
  output: {
    dir: './www',
    format: 'es'
  },
  external: [
    './identity.js',
    './../../monaco/monaco-loader.js',
    '@monaco-import'
  ],
  plugins: [
    clean(),
    json(),
    resolve({mainFields: ['browser', 'module', 'main']}),
    commonjs(),
    modify({
      '@monaco-import': './../../monaco/monaco-loader.js'
    })
  ]
}]
