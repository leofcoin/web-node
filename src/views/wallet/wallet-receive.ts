import { CSSResultGroup, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { property } from './../../decorators/property.js'
import { BaseElement, StyleList, html, css } from './../../base.js'

@customElement('wallet-receive')
export class WalletReceive extends BaseElement {
  @property({ type: String })
  amount: string

  @property()
  from: string

  static styles: StyleList = [
    css`
      :host {
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        display: flex;
        flex-direction: column;
      }
      flex-row {
        width: 100%;
      }
      .container {
        border-radius: 24px;
        padding: 24px;
        box-sizing: border-box;
        background: var(--secondary-background);
        color: var(--font-color);
        border: 1px solid var(--border-color);
        font-size: 18px;
        width: 100%;
        max-width: 320px;
      }
      input {
        margin-top: 12px;
        margin-bottom: 24px;
        box-sizing: border-box;
        width: 100%;
      }
      select,
      input,
      button {
        pointer-events: auto;
        background: transparent;
        border: 1px solid var(--border-color);
        font-size: 14px;
        color: var(--font-color);
        border-radius: 24px;
        padding: 6px 12px;
      }
      select,
      button {
        cursor: pointer;
      }
    `
  ]

  render() {
    return html`
      <flex-column class="container">
        <flex-row>
          <label for=".token-select">receive</label>
          <flex-it></flex-it>
          <select class="token-select">
            <option>LFC</option>
          </select>
        </flex-row>

        <label for=".amount">amount</label>
        <input class="amount" placeholder="1" value=${this.amount} />
        <label for=".from">from</label>
        <input class="from" placeholder="address" value=${this.from} />
        <flex-it></flex-it>
        <flex-row>
          <button data-action="cancel">cancel</button>
          <flex-it></flex-it>
          <button data-action="RequestPayment">request payment</button>
        </flex-row>
      </flex-column>
    `
  }
}
