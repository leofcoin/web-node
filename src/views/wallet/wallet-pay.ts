import { LitElement, html, css, CSSResultGroup } from 'lit'
import { Wallet, walletContext } from '../../context/wallet.js'
import { consume } from '@lit/context'
import { parseUnits } from '@leofcoin/utils'
import { signTransaction } from '@leofcoin/lib'
import { customElement, property } from 'lit/decorators.js'

@customElement('wallet-pay')
export class WalletPay extends LitElement {
  @consume({ context: walletContext, subscribe: true })
  wallet: Wallet
  @property()
  amount: string

  @property()
  to: string
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
        inset: 0;
        position: absolute;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        opacity: 0;
        background: #1116;
        transition: 0.25s;
      }

      :host([shown='true']) {
        opacity: 1;
        pointer-events: auto;
        z-index: 1002;
        transition: 0.25s;
      }

      .wrapper {
        background: var(--active-background);
        border-radius: 12px;
        box-sizing: border-box;
        padding: 12px 24px;
        height: 100%;
        max-height: 240px;
        max-width: 320px;
        width: 100%;
        color: var(--font-color);
        border: 1px solid var(--border-color);
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

      custom-pages {
        width: 100%;
        height: 100%;
      }

      span[data-route='touchpay'] {
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
      }
      .word {
        display: inline-flex;
        padding: 6px;
        border-radius: 3px;
        background: #fff;
        color: #333;
      }
    `
  ]
  render() {
    return html`
      <flex-column class="wrapper" center>
        <h4>Hold on</h4>
        <h5>NFC transaction request</h5>
        <flex-it flex="2"></flex-it>
        <flex-row>
          <h5>to:</h5>
          <h5 class="adress">${this.to}</h5>
        </flex-row>
        <flex-it></flex-it>
        <flex-row>
          <h5>amount:</h5>
          <h5 class="amount">${this.amount}</h5>
        </flex-row>
        <flex-it></flex-it>
        <flex-row>
          <button @click=${this.#close}>reject</button>
          <flex-it></flex-it>
          <button @click=${this.#accept}>accept</button>
        </flex-row>
      </flex-column>
    `
  }
}
