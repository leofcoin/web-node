import { rollup, watch } from 'rollup'
import config from './rollup.config.js'
import chokidar from 'chokidar'
import posix from 'path/posix'
import { sep } from 'path'
let cache

async function buildWithCache({ input, plugins, external }) {
  const bundle = await rollup({
    cache,
    input,
    plugins,
    external
  })
  cache = bundle.cache // store the cache object of the previous build
  return bundle
}

for (const build of config) {
  const watcher = chokidar.watch()
  watcher.add(build.input)
  console.log(watcher.getWatched())

  watcher.on('change', async () => {
    const bundle = await buildWithCache(build)
    await bundle.generate(build.output)
  })
  buildWithCache(build)
}
