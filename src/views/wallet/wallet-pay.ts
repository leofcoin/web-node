import { LitElement, html, css, CSSResultGroup } from 'lit'
import { Wallet, walletContext } from '../../context/wallet.js'
import { consume } from '@lit/context'
import { parseUnits } from '@leofcoin/utils'
import { signTransaction } from '@leofcoin/lib'
import { customElement, property } from 'lit/decorators.js'
import './../../elements/hero.js'
import '@vandeurenglenn/lit-elements/typography.js'

@customElement('wallet-pay')
export class WalletPay extends LitElement {
  @consume({ context: walletContext, subscribe: true })
  accessor wallet: Wallet

  @property()
  accessor amount: string

  @property()
  accessor to: string

  @property()
  accessor description: string

  @property()
  accessor protocol: string

  #accept = async () => {
    let from = this.wallet.selectedAccount
    console.log({ from })
    const token = (await client.nativeToken()) as unknown as string

    const nonce = (await client.getNonce(from)) as number
    const rawTransaction = {
      timestamp: Date.now(),
      from,
      to: token,
      method: 'transfer',
      nonce: nonce + 1,
      params: [from, this.to, parseUnits(this.amount).toString()]
    }
    const transaction = await signTransaction(rawTransaction, globalThis.identityController)
    console.log(transaction)
    const transactionEvent = await client.sendTransaction(transaction)
    console.log(transactionEvent)

    history.back()
  }
  #close = () => {
    history.back()
  }
  static styles?: CSSResultGroup = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        position: absolute;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        background: #1116;
      }

      input,
      button {
        pointer-events: auto;
        border-color: white;
        padding: 10px;
        border-radius: 12px;
        box-sizing: border-box;
      }

      input {
        font-size: 16px;
      }

      button {
        background: #12b8e4a3;
        color: white;
        border-color: white;
        background: transparent;
        padding: 10px 20px;
      }

      button:hover {
        background: var(--secondary-background);
        transition: 0.25s;
      }

      h5 {
        margin: 0;
      }
      flex-column {
        height: 100%;
      }

      flex-row {
        width: 100%;
      }

      .protocol {
        padding: 12px 24px;
        display: block;
        border: 1px solid var(--border-color);
        border-radius: 24px;
        position: absolute;
        bottom: 24px;
        background-color: var(--active-background);
      }
    `
  ]
  render() {
    return html`
      <custom-typography class="protocol" type="body" size="small"
        ><span>protocol: ${this.protocol}</span></custom-typography
      >
      <hero-element headline="Incoming Payment Request" .subline=${this.description}>
        <flex-column>
          <flex-it flex="3"></flex-it>
          <flex-row center>
            <custom-typography type="body" size="medium">to: </custom-typography>
            <custom-typography type="body" size="small">${this.to}</custom-typography>
          </flex-row>
          <flex-it></flex-it>
          <flex-row center>
            <custom-typography type="body" size="medium">amount: </custom-typography>
            <custom-typography type="body" size="small">${this.amount}</custom-typography>
          </flex-row>
          <flex-it flex="2"></flex-it>
          <flex-row>
            <button @click=${this.#close}>reject</button>
            <flex-it></flex-it>
            <button @click=${this.#accept}>accept</button>
          </flex-row>
        </flex-column>
      </hero-element>
    `
  }
}
