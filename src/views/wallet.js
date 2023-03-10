import '../elements/account.js'
// import { nativeToken } from './../../../node_modules/@leofcoin/addresses/src/addresses'
import { parseUnits } from '@leofcoin/utils'
import { signTransaction } from '@leofcoin/lib'
import { LitElement, html } from 'lit'
import { map } from 'lit/directives/map.js'

export default customElements.define('wallet-view', class WalletView extends LitElement {
  static properties = {
    accounts: {
      type: 'object'
    }
  }

  get #amount() {
    return this.renderRoot.querySelector('.amount')
  }

  get #to() {
    return this.renderRoot.querySelector('.to')
  }

  get #pages() {
    return this.renderRoot.querySelector('custom-pages')
  }

  constructor() {
    super()
  }

  async connectedCallback() {
    super.connectedCallback()
    this.renderRoot.addEventListener('click', this.#handleClick.bind(this))
    // console.log(await api.accounts());
    this.accounts = document.querySelector('app-shell').renderRoot.querySelector('identity-view').accounts
    
    await this.hasUpdated
    this.#select('send')
    this.#addressSelected({})
  }

  async #addressSelected({detail}) {
    if (!detail) detail = this.accounts[0][1]

    Array.from(this.renderRoot.querySelectorAll('.address')).forEach(item => {
      item.innerHTML = detail
    })

    this.selectedAccount = detail
    await client.selectAccount(detail)
  }

  #select(selected) {
    this.#pages.select(selected)
  }

  _cancel() {
    this.#to.value = null
    this.#amount.value = null
  }

  async _send() {
    const to = this.#to.value
    const amount = this.#amount.value
    let from = this.selectedAccount
    const token = await client.nativeToken()

    const nonce = await client.getNonce(from)
    const rawTransaction = {
      timestamp: Date.now(),
      from,
      to: token, 
      method: 'transfer',
      nonce: nonce + 1,
      params: [from, to, parseUnits(amount).toString()]
    }
    const transaction = await signTransaction(rawTransaction, globalThis.identityController)
    console.log(transaction);
    const transactionEvent = await client.sendTransaction(transaction)
    console.log(transactionEvent);
  }

  #handleClick(event) {
    const target = event.composedPath()[0]
    const action = target.getAttribute('data-action')
    action && this[`_${action}`]()
  }

  render() {
    return html`
<style>
  * {
    pointer-events: none;
  }

  :host {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
  }
  custom-pages {
    width: 100%;
    height: 100%;
  }
  [data-route="send"] {

    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
  }

  .peer-id {
    border: 1px solid white;
    border-radius: 12px;
    color: var(--font-color);
    position: absolute;
    /* top: 50%; */
    left: 50%;
    transform: translateX(-50%);
    top: 12px;
  }

  .wallet-nav-container {
    padding: 12px;
    box-sizing: border-box;
    height: 72px;
  }

  .wallet-nav {
    border: 1px solid white;
    background: var(--secondary-background);
    border-radius: 12px 6px;
    color: var(--font-color);
    padding: 12px 6px;
    box-sizing: border-box;
    align-items: center;
  }

  a {
    padding: 0 12px;
    cursor: pointer;
  }

  .container {
    border-radius: 24px;
    padding: 24px;
    box-sizing: border-box;
    background: var(--secondary-background);
    color: var(--font-color);
    border: 1px solid var(--border-color);
    font-size: 18px;
    width: 100%;
    max-width: 320px;
  }

  input {
    margin-top: 12px;
    margin-bottom: 24px;
    box-sizing: border-box;
  }

  .main {
    width: 100%;
  }

  select, input, button {
    pointer-events: auto;
    background: transparent;
    border: 1px solid var(--border-color);
    font-size: 14px;
    color: var(--font-color);
    border-radius: 24px;
    padding: 6px 12px;
  }

  select, button {
    cursor: pointer;
  }
</style>

<flex-column class="main">
  <custom-pages attr-for-selected="data-route">
    <flex-column data-route="send">
      <flex-column class="container">

        <flex-row>
          <label for=".amount">send</label>
          <flex-one></flex-one>
          <select>
            <option>ART</option>
          </select>
        </flex-row>
        <input class="amount" placeholder="1"></input>

        <label for=".to">to</label>
        <input class="to" placeholder="address"></input>

        <flex-one></flex-one>
        <flex-row>
          <button data-action="cancel">cancel</button>
          <flex-one></flex-one>
          <button data-action="send">send</button>
        </flex-row>
      </flex-column>

      <flex-column data-route="receive">
        <clipboard-copy class="address peer-id">
          loading...
        </clipboard-copy>
      </flex-column>
    </flex-column>
  </custom-pages>

  <flex-row class="wallet-nav-container">
    <flex-one></flex-one>
    <flex-row class="wallet-nav">
      <a title="send">
        <custom-svg-icon icon="send"></custom-svg-icon>
      </a>
      <a title="recceive">
        <custom-svg-icon icon="receive"></custom-svg-icon>
      </a>
      <a title="transactions">
        <custom-svg-icon icon="transactions"></custom-svg-icon>
      </a>
    </flex-row>
    <flex-one></flex-one>
  </flex-row>
</flex-column>
    `
  }
})
