import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js';
import '@material/web/button/elevated-button.js'
import type Client from '@leofcoin/endpoint-clients/direct'
import type Chain from '@leofcoin/chain/chain'

declare global {
  var client: Client
  var chain: Chain
}

@customElement('touchpay-screen')
//export class TouchPayScreen extends LitElement {
//  @property({ type: Boolean, reflect: true }) shown = false 
//  @property() address = 'no default?' // <- ION 
//  @property() amount = ''

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
    // also not needed
    // handled inn shell
    // so
    const parts = location.hash.split('/')
    let params = parts[1].split('?')
    const object = {}
    if (params.length > 1) {
      params = params[1].split('&')
      let param
//nirts1 whats this
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
  
  async  incomingTransactionRequest(amount) {
    await this.updateComplete
    this.amount = amount
    this.shown = true
  }

  close() {
    this.shown = false
  }

  changeclass(type){
    let box = this.shadowRoot.querySelector('[data-route="touchpay"]')
    let suc = this.shadowRoot.querySelector('[data-route="success"]')
    if (type == "load"){
      box.classList.add("hidden")
    }
      else if (type == "success"){
        suc.classList.remove("hidden")
      }
  }

  async #send() {
    let amount = this.amount
    let address = this.address
    this.changeclass("load")
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
          z-index: 1003;
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

        .hidden{
          opacity: 0;
          width: 0;
          height: 0;
          transition: 0.25s;
          display: none;
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
            <h3>NFC transaction request</h4>
            <flex-it></flex-it>
            <flex-row>
              <h4>to</h4>
              <h4 class="adress">: ...${this.address ? this.address.slice(-15) : ''}</h4>
            </flex-row>
            <flex-it></flex-it>
            <flex-row>
              <h4>amount</h4>
              <h4 class="amount">: ${this.amount}</h4>
            </flex-row>
            <flex-it></flex-it>
            <flex-row>
              <button @click=${this.close}>reject</button>
              <flex-it></flex-it>
              <button @click=${this.#send}>send</button>
            </flex-row>
          </flex-column>

          <flex-column data-route="success" class="hidden" center>
            <h3>svg here</h4>
            <flex-it></flex-it>
            <flex-row>
              <h4 class="amount">successfully sent ${this.amount} to </h4>
              <h4 class="adress"> ...${this.address ? this.address.slice(-15) : ''}</h4>
            </flex-row>
          </flex-column>

        </custom-pages>
      </flex-column>
    `
  }
}
