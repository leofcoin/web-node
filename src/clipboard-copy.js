import { html, LitElement } from "lit";

export default customElements.define('clipboard-copy', class ClipboardCopy extends LitElement {
  #value;

  static get properties() {
    return {
      value: { type: String }
    };
  }

  set value(value) {
    this.#value = value
  }
  
  constructor() {
    super()
    this.title = 'click to copy'
  }

  copy() {
    navigator.clipboard.writeText(this.#value || this.innerHTML);
    const innerHTML = this.innerHTML
    this.innerHTML = 'copied!'

    setTimeout(() => this.innerHTML = innerHTML, 750)
  }

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', this.copy.bind(this))
  }

  render() {
    return html`
<style>
  * {
    pointer-events: none;
  }
  :host {
    display: flex;
    padding: 6px 12px;
    box-sizing: border-box;
    pointer-events: auto !important;
    cursor: pointer;
    font-size: 14px;
  }
</style>
<slot></slot>
    `
  }

})
