import Koa from 'koa'
import koaStatic from 'koa-static'

const server = new Koa()

server.use(koaStatic('./www'))

server.listen(3030)