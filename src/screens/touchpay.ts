import { html, LitElement } from 'lit'
import '@material/web/button/elevated-button.js'
import type Client from '@leofcoin/endpoint-clients/direct'
import type Chain from '@leofcoin/chain/chain'

declare global {
  var client: Client
  var chain: Chain
}
export default customElements.define(
  'touchpay-screen',
  class TouchPayScreen extends LitElement {
    static properties = {
      shown: {
        type: 'boolean',
        reflect: true
      },
      exported: {
        type: 'string'
      },
      adress: {
        type: 'integer'
      },
      amount: {
        type: 'string'
      }
    }

    checkChanges(address, amount) {
      const parts = location.hash.split('/')
      let params = parts[1].split('?')
      const object = {}
      if (params.length > 1) {
        params = params[1].split('&')
        for (let param of params) {
          param = param.split('=')
          object[param[0]] = param[1]
        }
      }
      if ((address == object.address, amount == object.amount)) {
        this.address = address
        this.incomingTransactionRequest(amount)
      }
    }

    incomingTransactionRequest(amount) {
      this.amount = amount
      this.shown = true
    }

    close() {
      this.shown = false
    }

    async #send() {
      let amount = this.amount
      let address = this.address
      document.querySelector('app-shell').renderRoot.querySelector('wallet-view')._send(address, amount)
    }

    render() {
      return html`
        <style>
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
            margin-left: 48px;
          }

          input,
          button {
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
        </style>
        <flex-column class="wrapper">
          <custom-pages attr-for-selected="data-route">
            <flex-column data-route="touchpay" center>
              <h4>Hold on</h4>
              <h5>NFC transaction request</h5>
              <flex-it flex="2"></flex-it>
              <flex-row>
                <h5>to:</h5>
                <h5 class="adress">${this.address}</h5>
              </flex-row>
              <flex-it></flex-it>
              <flex-row>
                <h5>amount:</h5>
                <h5 class="amount">${this.amount}</h5>
              </flex-row>
              <flex-it></flex-it>
              <flex-row>
                <button @click=${this.close}>reject</button>
                <flex-it></flex-it>
                <button @click=${this.#send}>send</button>
              </flex-row>
            </flex-column>
          </custom-pages>
        </flex-column>
      `
    }
  }
)
