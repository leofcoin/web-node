// import { nativeToken } from './../../../node_modules/@leofcoin/addresses/src/addresses'
import { parseUnits } from '@leofcoin/utils'
import { LitElement, html } from 'lit'
import './../elements/button.js'
import './../elements/navigation-bar.js'

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
  }


  async select(selected) {
    console.log(selected);
    if (!customElements.get(`identity-${selected}`)) await import(`./identity-${selected}.js`)
    if (selected !== 'actions') this.renderRoot.querySelector(`identity-${selected}`).accounts = this.accounts
    this.shadowRoot.querySelector('custom-pages').select(selected)
    this.renderRoot.querySelector('navigation-bar').select(selected)
  }

  #customSelect({detail}) {
    location.hash = `#!/identity?selected=${detail}`
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

  .accounts-container {
    padding: 12px;
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

  h2, h4 {
    margin: 0;
  }

  h2 {
    padding-bottom: 12px;
  }

  navigation-bar {
    padding-bottom: 24px;
    pointer-events: auto;
  }

  custom-pages {
    width: 100%;
    height: 100%;
    display: flex;
  }

  custom-svg-icon {
    --svg-icon-size: 160px;
  }
</style>
<custom-svg-icon icon="account-circle"></custom-svg-icon>
<h2>Identity</h2>

<navigation-bar items='["dashboard", "accounts", "actions"]' @selected="${this.#customSelect}"></navigation-bar>

<custom-pages attr-for-selected="data-route">
  <identity-dashboard data-route="dashboard"></identity-dashboard>
  <identity-accounts data-route="accounts"></identity-accounts>
  <identity-account data-route="account"></identity-account>
  <identity-actions data-route="actions"></identity-actions>
</custom-pages>
    `
  }
})
