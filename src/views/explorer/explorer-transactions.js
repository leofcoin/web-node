import { html, LitElement } from 'lit'
import {map} from 'lit/directives/map.js'
import '../../elements/latest.js'
import '../../elements/explorer/info-container.js'
import { formatBytes } from '@leofcoin/utils'


export default customElements.define('explorer-transactions', class ExplorerTransactions extends LitElement {
  #blocks
  static properties = {
    items: {
      type: Array
    }
  }

  constructor() {
    super()
  }
  #transactions = []

  async updateInfo() {

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
    }]]
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

  flex-row {
    width: 100%;
    align-items: center;
    justify-content: center;
  }

  flex-column {
    max-width: 600px;
    max-height: 600px;
    width: 100%;
    height: 100%;
  }

  .latest-transactions {
    width: 100%;
    height: 100%;
    padding: 12px;
    box-sizing: border-box;
    
    overflow-y: auto;
  }

  .container {
    padding: 12px;
    box-sizing: border-box;
    background: #ffffff52;
    border-radius: 24px;
    box-shadow: 1px 1px 14px 0px #0000002e;
  }
  
  .container h4 {
    padding-left: 12px;
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
  
  h4 {
    margin: 0;
    padding: 6px 0;
  }
</style>

<flex-wrap-evenly data-route="home">
<flex-column class="container">
  <h4>latest transactions</h4>
  <flex-column class="latest-transactions">
    ${map(this.#transactions, item => html`
      <latest-element value=${JSON.stringify(item)} type="transaction"></latest-element>
    `)}
  </flex-column>
</flex-column>
</flex-wrap-evenly>
`
  }
})
