// import { nativeToken } from './../../../node_modules/@leofcoin/addresses/src/addresses'
import { parseUnits } from '@leofcoin/utils'
import { LitElement, html } from 'lit'
import * as qrcode from 'qrcode'

export default customElements.define(
  'identity-actions',
  class IdentityActions extends LitElement {
    static properties = {
      accounts: {
        type: 'object'
      }
    }

    constructor() {
      super()
    }

    async #export() {
      const password = await document
        .querySelector('app-shell')
        .shadowRoot.querySelector('login-screen')
        .requestPassword()
      const exported = await globalThis.identityController.export(password)
      const qr = await qrcode.toDataURL(exported)
      document.querySelector('app-shell').shadowRoot.querySelector('export-screen').show(qr, exported)
      console.log(qr)
    }
    render() {
      return html`
        <style>
          * {
            pointer-events: none;
          }

          :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            padding: 24px;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          }
          .account-container {
            padding: 12px;
            box-sizing: border-box;
          }

          .container {
            max-width: 480px;
            max-height: 480px;
            width: 100%;
            height: 100%;
            padding: 12px;
            box-sizing: border-box;
            background: #ffffff52;
            border-radius: 24px;
            box-shadow: 1px 1px 14px 0px #0000002e;
          }
        </style>
        <flex-row>
          <flex-one></flex-one>
          <button-element>view mnemonic</button-element>
          <flex-two></flex-two>
          <button-element @click=${this.#export}>export</button-element>
          <flex-one></flex-one>
        </flex-row>
      `
    }
  }
)
