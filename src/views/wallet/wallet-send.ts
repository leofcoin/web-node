import { CSSResultGroup, LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('wallet-send')
export class WalletSend extends LitElement {
  @property()
  accessor amount: string

  @property()
  accessor to: string

  static styles?: CSSResultGroup = [
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

  protected render() {
    return html`
      <flex-column class="container">
        <flex-row>
          <label for=".amount">send</label>
          <flex-it></flex-it>
          <select>
            <option>LFC</option>
          </select>
        </flex-row>
        <input class="amount" placeholder="1" value=${this.amount} />
        <label for=".to">to</label>
        <input class="to" placeholder="address" value=${this.to} />
        <flex-it></flex-it>
        <flex-row>
          <button data-action="cancel">cancel</button>
          <flex-it></flex-it>
          <button data-action="RequestSend">send</button>
        </flex-row>
      </flex-column>
    `
  }
}
