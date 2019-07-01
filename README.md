# web-node
> An Ipfs node running on the Leofcoin network

## install
```sh
npm i --save @leofcoin/web-node
```
## usage
```js
import webNode from '@leofcoin/web-node';

(async () =>  {
  await webNode();
  // node.get(<multihash>)
  
  // window.node
  // window.repo
  // window.room
})()
```

## todo
create branch for each network