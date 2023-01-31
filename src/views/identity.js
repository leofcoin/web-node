// import { nativeToken } from './../../../node_modules/@leofcoin/addresses/src/addresses'
import { parseUnits } from '@leofcoin/utils'
import { LitElement, html } from 'lit'
import { map } from 'lit/directives/map.js'
import qrcode from 'qrcode'
import './../elements/button.js'

export default customElements.define('identity-view', class IdentityView extends LitElement {

  static properties = {
    identity: {
      type: 'object'
    },
    accounts: {
      type: 'object'
    }
  }

  get #pages() {
    return this.shadowRoot.querySelector('custom-pages')
  }

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
  }

  async #export() {
    const password = await document.querySelector('app-shell').renderRoot.querySelector('login-screen').requestPassword()
    const exported = await globalThis.identityController.export(password)
    const qr = await qrcode.toDataURL(exported)
    document.querySelector('app-shell').renderRoot.querySelector('export-screen').show(qr, exported)
    console.log(qr);
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
    box-sizing: border-box;
  }

  .accounts-container {
    padding: 12px;
    box-sizing: border-box;
  }

  .account-container {
    padding: 12px;
    box-sizing: border-box;
  }
</style>
<h4>accounts</h4>
<flex-column class="accounts-container">

${map(this.accounts, ([name, external, internal]) => html`
    <strong>${name}</strong>
  <flex-column class="account-container">
    
    <flex-row>
      <strong>external</strong>
      <flex-one></flex-one>
      <span>${external}</span>
    </flex-row>

    <flex-row>
      <strong>internal</strong>
      <flex-one></flex-one>
      <span>${internal}</span>
    </flex-row>
  </flex-column>
`)}
</flex-column>

<flex-row>
  <flex-one></flex-one>
  <button-element>view mnemonic</button-element>
  <flex-two></flex-two>
  <button-element @click=${this.#export}>export</button-element>
  <flex-one></flex-one>
</flex-row>


    `
  }
})
