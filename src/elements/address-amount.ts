import { css, html, LitElement } from "lit";
import { map } from "lit/directives/map.js";
import {formatUnits} from '@leofcoin/utils'

export default customElements.define('address-amount', class AddressAmount extends LitElement {
  #address;

  static properties = {
    address: {
      type: String,
      reflect: true
    },
    amount: {
      type: Number
    }
  }

  set address(value) {
    this.#address = value
    if (value) this.#updateAmount()
  }
  constructor() {
    super()
  }

  async #updateAmount() {
    const amount = await globalThis.client.balanceOf(this.#address, false)
    if (!amount?._isBigNumber) this.amount = 0
    else this.amount = (formatUnits(amount)).toLocaleString()
  }

  static styles = css`
  :host {
    display: flex;
    box-sizing: border-box;
    text-overflow: ellipsis;
    overflow: hidden;
    background: #7986cb;
    color: #fff;
    padding: 6px 12px;
    box-sizing: border-box;
    border-radius: 24px;
  }
  `

  render() {
    return html`
    ${this.amount}
    `

  }
})