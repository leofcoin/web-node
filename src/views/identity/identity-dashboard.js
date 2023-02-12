// import { nativeToken } from './../../../node_modules/@leofcoin/addresses/src/addresses'
import { parseUnits } from '@leofcoin/utils'
import { LitElement, html } from 'lit'
import { map } from 'lit/directives/map.js'

export default customElements.define('identity-dashboard', class IdentityDashboard extends LitElement {

  static properties = {
    accounts: {
      type: 'object'
    }
  }

  constructor() {
    super()
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
  flex-row {

    display: flex;
    flex-direction: column;
    background: #2c314a00;
    border-radius: 24px;
    box-sizing: border-box;
    padding: 6px 12px;
    box-shadow: 0px 0px 16px 6px #8890b75c;
    max-width: 240px;
    max-height: 54px;
    width: 100%;
    height: 100%;
  }
</style>
<flex-wrap-evenly>
  <flex-row>
    <strong>transactions</strong>
    <flex-one></flex-one>
    <span>${this.value?.totalTransactions || 0}</span>
  </flex-row>

  <flex-row>
    <strong>total amount</strong>
    <flex-one></flex-one>
    <span>${this.value?.totalValue || 0}</span>
  </flex-row>
</flex-wrap-evenly>
`
  }
})
