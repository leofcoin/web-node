import * as Protector from 'libp2p-pnet';
import DelegatedContentRouting from 'libp2p-delegated-content-routing';
import dapnets from '@leofcoin/dapnets';
import discoRoom from '@leofcoin/disco-room';

// default is to use ipfs.io
let routing = new DelegatedContentRouting('QmVDtTRCoYyYu5JFdtrtBMS4ekPn8f9NndymoHdWuuJ7N2', {
  // use default api settings
  protocol: 'https',
  port: 443,
  host: 'star.leofcoin.org'
});

// 
// routing.findProviders(key, (err, peerInfos) => {
//   if (err) {
//     return console.error(err)
//   }
// 
//   console.log('found peers', peerInfos)
// })
// 
// routing.provide(key, (err) => {
//   if (err) {
//     return console.error(err)
//   }
// 
//   console.log('providing %s', key)
// })

const importScript = src => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.onload = () => resolve();
  script.onerror = () => reject();
  script.src = src;
  document.head.appendChild(script);
});

export default async () => {
  try {
    const net = await dapnets('leofcoin');
    await importScript('https://unpkg.com/ipfs-repo/dist/index.min.js');
    window.repo = new IpfsRepo('leofcoin');
    if (!await repo.exists()) repo.init({ lock: 'memory' });
    await importScript('https://unpkg.com/ipfs/dist/index.min.js');
    window.node = new Ipfs({
      repo: 'leofcoin',
      relay: {
        enabled: true, // enable relay dialer/listener (STOP)
        hop: {
          enabled: true // make this node a relay (HOP)
        }
      },
      EXPERIMENTAL: {
        pubsub: true, // enable pubsub
        ipnsPubsub: true,
        sharding: true,
        dht: true
      },
      config: {
        Bootstrap: ['/ip4/162.208.10.171/tcp/4005/ws/ipfs/QmVDtTRCoYyYu5JFdtrtBMS4ekPn8f9NndymoHdWuuJ7N2']
      },
      libp2p: {
        modules: {
          contentRouting: routing,
          connProtector: new Protector(net.swarmKey)
        }
      }
    });   

    const ready = () => new Promise((resolve, reject) => {  
      node.once('ready', async () => {
        const {id} = await node.id()
        const room = new discoRoom(node, `${net.netPrefix}-signal`);
        resolve(room);
      })
    });
    
    window.room = await ready();
    return;
  } catch(e) {
    throw e;
  }

}
