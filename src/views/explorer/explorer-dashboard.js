import { html, LitElement } from 'lit'
import {map} from 'lit/directives/map.js'
import '../../elements/latest.js'
import '../../elements/explorer/info-container.js'
import { formatBytes } from '@leofcoin/utils'


export default customElements.define('explorer-dashboard', class ExplorerDashboard extends LitElement {

  static properties = {
    items: {
      type: Array
    }
  }

  constructor() {
    super()
  }
  #blocks = []
  #transactions = []

  async updateInfo() {
    const lookupValidators = await client.lookup('ArtOnlineValidators')
    
    const validators = await client.staticCall(lookupValidators.address, 'validators')
    const lookupFactory = await client.lookup('ArtOnlineContractFactory')

    this.items = [[{
      title: 'transactions',
      items: [{
        title: 'transfers',
        value: await client.nativeTransfers()
      }, {
        title: 'burns',
        value: await client.nativeBurns()
      }, {
        title: 'mints',
        value: await client.nativeMints()
      }]        
    }, {
      title: 'validators',
      items: [{
        title: 'total',
        value: Object.keys(validators).length
      }, {
        title: 'online',
        value: Object.values(validators).filter(({lastSeen}) => lastSeen - new Date().getTime() < 60_000).length
      }]
    }], [{
      title: 'contracts',
      items: [{
        title: 'total',
        value: (await client.contracts()).length
      }, {
        title: 'registered',
        value: await client.staticCall(lookupFactory.address, 'totalContracts')        
      }, {
        title: 'native calls',
        value: await client.nativeCalls()
      }]
    }, {
      title: 'chain',
      items: [{
        title: 'blocks',
        value: await client.totalBlocks()
      }, {
        title: 'transactions',
        value: await client.totalTransactions()
      }, {
        title: 'size',
        value: formatBytes(await client.totalSize())
      }]
    }]]
  }

  async select(selected) {
    if (!customElements.get(`${selected}-view`)) await import(`./${selected}.js`)
    this.selected = selected
    this.shadowRoot.querySelector('custom-pages').select(selected)    
  }

  setInfo(hash, index) {
    console.log(hash, index);
    this.shadowRoot.querySelector('custom-pages').querySelector('.custom-selected').updateInfo(hash, index)
  }

  #addBlock(block) {
    console.log(block);
    if (block.transactions.length > 25) {
      this.#transactions = block.transactions.slice(-25)
    } else {
      this.#transactions = [ ...block.transactions, ...this.#transactions.slice(-(block.transactions.length - 1))]
    }

    this.requestUpdate()
    
  }

  async connectedCallback() {
    super.connectedCallback()
    this.#blocks = (await client.blocks(-25)).reverse()
    console.log(this.#blocks);
    let i = 0
    while (this.#transactions.length < 25 && this.#blocks.length -1 >= i) {
      console.log(this.#blocks[i]);
      if (this.#blocks[i].transactions.length < 25) this.#blocks[i].transactions.slice(0, this.#blocks[i].transactions.length - 1)
      this.#transactions = [...this.#transactions, ...this.#blocks[i].transactions.slice(-25)]
      i++
    }

    this.updateInfo()
    this.requestUpdate()

    client.pubsub.subscribe('add-block', this.#addBlock.bind(this))
    client.pubsub.subscribe('block-processed', this.#addBlock.bind(this))
  }

  render() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }

  flex-wrap-evenly {
    padding: 48px;
    box-sizing: border-box;
    overflow-y: auto;
  }

  flex-column {
    max-width: 600px;
    max-height: 480px;
    width: 100%;
    height: 100%;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgb(73 78 112);
    border-radius: 10px;
    margin: 12px 0;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(225,255,255,0.5);
  }

  explorer-info-container:first-child {
    margin-bottom: 12px;
  }

  explorer-info-container explorer-info:first-child {
    margin-right: 12px;
  }
</style>
<flex-wrap-evenly>
  ${map(this.items, item => html`
  <flex-column style="height: auto;">
    <explorer-info-container items=${JSON.stringify(item)}></explorer-info-container>
  </flex-column>
  
  `)}

</flex-wrap-evenly>
`
  }
})
