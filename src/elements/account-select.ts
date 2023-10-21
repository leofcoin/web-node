import { css, html, LitElement } from "lit";
import { map } from "lit/directives/map.js";
import './very-short-string.js'
import './address-amount.js'

export default customElements.define('account-select', class AccountSelect extends LitElement {
  static properties = {
    selected: {
      type: String
    },
    accounts: {
      type: Array
    },
    selecting: {
      type: Boolean,
      reflect: true
    },
    _icon: {
      type: String
    }
  }

  get #iconElement() {
    return this.renderRoot.querySelector('custom-svg-icon')
  }

  constructor() {
    super()
  }

  async connectedCallback() {
    super.connectedCallback && super.connectedCallback()

    // this.accounts = await identityController.accounts()

    pubsub.subscribe('identity-change', this.#identityChange.bind(this))
  }

  /**
   * 
   * @param {Array} accounts
   * @param {Number} selectedAaccount 
   */
  async #identityChange({ accounts, selectedAccountIndex }) {
    this.accounts = accounts
    this.selected = accounts[selectedAccountIndex]
    this.title = this.selected[1]
    // if (!this.selected) 
    console.log({accounts, selectedAccountIndex});
  }

  async startSelect() {
    this.selecting = true
    
    
  }

  static styles = css`
  :host {
    display: flex;
    flex-direction: column;
    top: 12px;
    right: 12px;
    position: absolute;
    z-index: 1001;
    color: var(--font-color);
    min-width: 210px;
  }
  :host([selecting]) custom-svg-icon {
    transform: rotate(180deg);
    transition: transform ease-in 60ms;
  }

  flex-row {
    width: 100%;
  }
  custom-svg-icon {
    pointer-events: auto;
    cursor: pointer;
  }

  address-amount {
    padding: 0 6px;
  }

  .selected-container {
    align-items: center;
    background: var(--secondary-background);
    border-radius: 24px;
    box-sizing: border-box;
    padding: 6px 12px;
    border: 1px solid var(--border-color);
  }

  .seperator {
    display: flex;
    height: 12px;
  }

  .accounts-container {
    
    background: var(--active-background);
    border-radius: 24px;
    box-sizing: border-box;
    padding: 6px 12px;
    border: 1px solid var(--border-color);
  }

  .account-container {
    align-items: center;
  }

  very-short-string {
    padding: 0 12px;
  }
  `

  render() {
    return html`
    <flex-row class="selected-container">
      ${this.selected ? this.selected[0] : html`<busy-animation></busy-animation>`}
      <flex-it></flex-it>
      <address-amount address=${this.selected[1]}></address-amount>
      <custom-svg-icon icon="arrow-drop-down" @click="${() => this.selecting = !this.selecting}"></custom-svg-icon>
    </flex-row>


    ${this.selecting ? html`
    <span class="seperator"></span>
    <flex-column class="accounts-container">
      ${map(this.accounts, item => html`
      <flex-column class="account-container">
        <flex-row>
          <strong>${item[0]}</strong>
          <flex-it></flex-it>
          <very-short-string value=${item[1]}></very-short-string>
        </flex-row>
        <flex-row>
          <flex-it></flex-it>
          <address-amount address=${item[1]}></address-amount>
        </flex-row>
      </flex-column>
      `)}  
    </flex-column>
    ` : ''}
    
    `
  }
})