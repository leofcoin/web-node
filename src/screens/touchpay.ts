import { html, css, LitElement } from "lit";
import generateAccount from '@leofcoin/generate-account'
import IdentityController from '../controllers/identity.js'
import '@material/web/button/elevated-button.js'
import networks from '@leofcoin/networks'
import QrScanner from "qr-scanner";
import { decrypt, encrypt } from "@leofcoin/identity-utils";
import base58 from '@vandeurenglenn/base58'
import type Client from '@leofcoin/endpoint-clients/direct'
import { customElement, property, state } from "lit/decorators.js";
import type Chain from "@leofcoin/chain/chain";


declare global {
  var client: Client
  var chain: Chain
}
export default customElements.define('touchpay-screen', class ExportScreen extends LitElement {
  static properties = {
    shown: {
      type: 'boolean',
      reflect: true
    },
    qrcode: {
      type: 'string'
    },
    exported: {
      type: 'string'
    }
  }

   IncomingTransactionRequest(qr, exported) {
    //this.qrcode = qr
    //this.renderRoot.querySelector('clipboard-copy').value = exported
    this.shown = true
  }

  #close() {
    this.shown = false
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

  :host([shown]) {
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

  input, button {
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

  button:hover{
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

  span[data-route="login"] {
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
      <h4>Hold on</h4>
      <h5>NFC transaction request</h5>
      <flex-it flex="2"></flex-it>
      <h5>to:</h5> <h5 class="adress">nil</h5>
      <flex-it></flex-it>
      <h5>amount</h5> <h5 class="amount">nil</h5>
      <flex-it></flex-it>
      <button data-action="reject">reject</button>
      <flex-it></flex-it>
      <button data-action="send">send</button>
      `
  }
})
  