import { css, html, LitElement } from 'lit'
import {map} from 'lit/directives/map.js'
import '../elements/latest.js'
import '../elements/explorer/info-container.js'
import { formatBytes } from '@leofcoin/utils'
import '../elements/navigation-bar.js'

export default customElements.define('explorer-view', class ExplorerView extends LitElement {
  static properties = {
    selected: {
      type: String
    }
  }
  static get styles() {
    return css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow-y: auto;
    }
    .navigation-bar {
      padding: 24px 0;
    }
    `
  }
  constructor() {
    super()
  }

  async select(selected) {
    console.log(selected);
    this.selected = selected
    await this.updateComplete
    if (!customElements.get(`explorer-${selected}`)) await import(`./explorer-${selected}.js`)
    this.shadowRoot.querySelector('custom-pages').select(selected)
    this.renderRoot.querySelector('navigation-bar')?.select(selected)
  }

  #customSelect({detail}) {
    location.hash = `#!/explorer?selected=${detail}`
    // this.select(detail)
  }

  render() {
    return html`
    <custom-pages attr-for-selected="data-route">
      <explorer-dashboard data-route="dashboard"></explorer-dashboard>
      <explorer-blocks data-route="blocks"></explorer-blocks>
      <explorer-block data-route="block"></explorer-block>
      <explorer-block-transactions data-route="block-transactions"></explorer-block-transactions>
      <explorer-transactions data-route="transactions"></explorer-transactions>
      <explorer-transaction data-route="transaction"></explorer-transaction>
      <explorer-pool data-route="pool"></explorer-pool>
    </custom-pages>

    ${this.selected === 'transactions' || this.selected === 'blocks' || this.selected === 'dashboard' || this.selected === 'pool' ? html`
      <flex-row class="navigation-bar">
        <flex-one></flex-one>
        <navigation-bar items='["dashboard", "blocks", "transactions", "pool"]' @selected="${this.#customSelect}"></navigation-bar> 
        <flex-one></flex-one>
      </flex-row>
    ` : ''}
    
`
  }
})
