import Koa from 'koa'
import koaStatic from 'koa-static'
import open from 'open'

const server = new Koa()

server.use(koaStatic('./www'))

server.listen(3030)

open('http://localhost:3030')