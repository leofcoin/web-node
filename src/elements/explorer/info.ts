import { html, LitElement } from 'lit'
import {map} from 'lit/directives/map.js'

export default customElements.define('explorer-info', class ExplorerInfo extends LitElement {

  static properties = {
    title: {
      type: String
    },
    items: {
      type: Array
    }
  }

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
  }

  render() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    background: var(--secondary-background);
    border-radius: 24px;
    box-sizing: border-box;
    border: 1px solid var(--border-color);
    max-width: 600px;
    max-height: 480px;
    width: 100%;
    height: 100%;
    color: var(--font-color);
  }


  flex-row {
    width: 100%;
    align-items: center;
    justify-content: center;
  }

  h4 {
    margin: 0;
  }

  .title-container {
    border-bottom: 1px solid var(--border-color);

    box-sizing: border-box;
    padding: 6px 12px;
  }
  .content-container {

    box-sizing: border-box;
    padding: 12px;
  }
</style>
<flex-column class="title-container">

<h4>${this.title}</h4>
</flex-column>
<flex-one></flex-one>

<flex-column class="content-container">
    ${map(this.items, item => html`
    <flex-row>
      <span>${item.title}</span>
      <flex-it></flex-it>
      <strong>${item.value}</strong>  
    </flex-row>
    `)}

</flex-column>

  `
  }
})
