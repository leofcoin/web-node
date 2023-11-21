import typescript from '@rollup/plugin-typescript'
import { cp, readdir, unlink } from 'fs/promises'
import { join } from 'path'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import modify from 'rollup-plugin-modify'
import json from '@rollup/plugin-json'
import packagesJSON from './package.json' assert { type: 'json'}
import materialSymbols from 'rollup-plugin-material-symbols'

const date = new Date()

const BUILD = `${date.getUTCFullYear()}_${date.getDay()}_${date.getDay()}-${date.getTime()}`

const views = [
  ...(await readdir('./src/views')).map(path => join('./src/views', path)).filter(path => path.endsWith('.ts')),
  ...(await readdir('./src/views/explorer')).map(path => join('./src/views/explorer', path)),
  ...(await readdir('./src/views/identity')).map(path => join('./src/views/identity', path))
]

console.log(views)

// const templates = (await readdir('./src/templates')).map(path => join('./src/templates', path))
const cleanWWW = async () => {
  return {
    name: 'clean-www', // this name will show up in warnings and errors
    generateBundle: async ()=> {
      const files = await readdir('www')
      for (const file of files) {
        if (file.endsWith('.js') && !file.includes('monaco')) await unlink(join('www', file))
        
      }
      return 
    }
  };
  
  
}

const copyChain = async () => {
  return {
    name: 'copy-chain', // this name will show up in warnings and errors
    generateBundle: async ()=> {
      await cp('node_modules/@leofcoin/chain/exports/browser/node-browser.js', 'www/node-browser.js')
      return 
    }
  };
  
  
}

export default [{
  input: ['./src/shell.ts', ...views, './node_modules/@leofcoin/storage/exports/browser-store.js'],
  output: {
    dir: './www',
    format: 'es'
  },
  external: [
    './identity.js',
    './../../monaco/monaco-loader.js',
    '@monaco-import',
    './node-browser.js'
  ],
  plugins: [
    
    typescript(),
    cleanWWW(),
    // copyChain(),
    json(),
    resolve({mainFields: ['browser', 'module', 'main']}),
    commonjs(),
    copyChain(),
    materialSymbols({
      placeholderPrefix: 'symbol',
    }),
    modify({
      '@build': BUILD,
      '@version': packagesJSON.version,
      '@monaco-import': './../../monaco/monaco-loader.js',
      './exports/browser/workers/machine-worker.js': 'workers/machine-worker.js',
    })
  ]
}, {
  input: ['./node_modules/@leofcoin/workers/src/machine-worker.js', './node_modules/@leofcoin/workers/src/block-worker.js'],
  output: {
    dir: './www/workers',
    format: 'es'
  },

  plugins: [
    json(),
    modify({
      '@leofcoin/workers/block-worker.js': 'block-worker.js',
    }),
    resolve({
      mainFields: ['module', 'browser']
    }),
    commonjs()
  ]
}]
