'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Protector = require('libp2p-pnet');
var dapnets = _interopDefault(require('@leofcoin/dapnets'));
var discoRoom = _interopDefault(require('@leofcoin/disco-room'));

const importScript = src => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.onload = () => resolve();
  script.onerror = () => reject();
  script.src = src;
  document.head.appendChild(script);
});

var webnode = async () => {
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
          connProtector: new Protector(net.swarmKey)
        }
      }
    });   

    const ready = () => new Promise((resolve, reject) => {  
      node.once('ready', () => {
        const room = new discoRoom(node, `${net.netPrefix}-signal`);
        resolve(room);
      });
    });
    
    window.room = await ready();
    return;
  } catch(e) {
    throw e;
  }

};

module.exports = webnode;
