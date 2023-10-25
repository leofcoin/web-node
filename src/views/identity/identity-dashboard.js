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
  flex-row {

    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background: var(--secondary-background);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 12px 24px;
    max-width: 240px;
    max-height: 54px;
    width: 100%;
    height: 100%;
    justify-content: center;
    margin-bottom: 12px;
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
