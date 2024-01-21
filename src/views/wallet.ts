import '../elements/account.js'
// import { nativeToken } from './../../../node_modules/@leofcoin/addresses/src/addresses'
import { parseUnits } from '@leofcoin/utils'
import { signTransaction } from '@leofcoin/lib'
import { LitElement, PropertyValueMap, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { consume } from '@lit/context'
import { walletContext, Address, Accounts, Wallet } from '../context/wallet.js'
import { CustomPages } from '@vandeurenglenn/lit-elements/pages.js'
import '@vandeurenglenn/lit-elements/tabs.js'
import '@vandeurenglenn/lit-elements/tab.js'
import { WalletPay } from './wallet/wallet-pay.js'
@customElement('wallet-view')
export class WalletView extends LitElement {
  @property({ type: Array })
  accounts: Accounts

  @property({ type: String })
  selectedAccount: Address

  @property({ type: Object })
  @consume({ context: walletContext, subscribe: true })
  wallet: Wallet

  get #amount() {
    return this.renderRoot.querySelector('.amount') as HTMLInputElement
  }

  get #to() {
    return this.renderRoot.querySelector('.to') as HTMLInputElement
  }

  get pages(): CustomPages {
    return this.renderRoot.querySelector('custom-pages') as unknown as CustomPages
  }

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has('wallet')) {
      this.selectedAccount = this.wallet.selectedAccount
      this.accounts = this.wallet.accounts
      client.selectAccount(this.wallet.selectedAccount)
    }
  }

  async select(selected) {
    if (selected === 'pay') {
      const appShell = document.querySelector('app-shell')
      const appPages = appShell.shadowRoot.querySelector('custom-pages') as CustomPages
      appPages.style.position = 'fixed'

      const payEl = this.pages.querySelector('[data-route="pay"]') as WalletPay
      payEl.style.position = 'fixed'
    }

    if (!customElements.get(`wallet-${selected}`)) await import(`./wallet-${selected}.js`)
    this.pages.select(selected)
  }

  _cancel() {
    this.#to.value = null
    this.#amount.value = null
  }

  async _requestSend() {
    const to = this.#to.value
    const amount = this.#amount.value
    this._send(to, amount)
  }

  async _send(to, amount) {
    let from = this.selectedAccount
    console.log({ from })
    const token = (await client.nativeToken()) as unknown as string

    const nonce = (await client.getNonce(from)) as number
    const rawTransaction = {
      timestamp: Date.now(),
      from,
      to: token,
      method: 'transfer',
      nonce: nonce + 1,
      params: [from, to, parseUnits(amount).toString()]
    }
    const transaction = await signTransaction(rawTransaction, globalThis.identityController)
    console.log(transaction)
    const transactionEvent = await client.sendTransaction(transaction)

    console.log(transactionEvent)
    document.querySelector('app-shell').renderRoot.querySelector('touchpay-screen').close()
    this._cancel
  }

  #handleClick = (event) => {
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
          justify-content: center;
        }
        custom-pages {
          width: 100%;
          height: 100%;
        }
        .main {
          width: 100%;
          align-items: center;
        }
        custom-tab {
          pointer-events: auto;
        }
      </style>
      <flex-column class="main" @click=${this.#handleClick}>
        <custom-pages attr-for-selected="data-route">
          <wallet-send data-route="send"></wallet-send>
          <wallet-pay data-route="pay"></wallet-pay>
        </custom-pages>
        <custom-tabs
          round
          class="wallet-nav"
          attr-for-selected="data-route"
          @selected=${(event) => this.pages.select(event.detail)}
        >
          <custom-tab title="send" data-route="send">
            <custom-icon icon="call_made"></custom-icon>
          </custom-tab>
          <custom-tab title="receive" data-route="receive">
            <custom-icon icon="call_received"></custom-icon>
          </custom-tab>
          <custom-tab title="transactions" data-route="transactions">
            <custom-icon icon="list"></custom-icon>
          </custom-tab>
        </custom-tabs>
      </flex-column>
    `
  }
}
