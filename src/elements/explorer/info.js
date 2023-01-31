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
    background: #2c314a00;
    border-radius: 24px;
    box-sizing: border-box;
    padding: 6px 12px;
    box-shadow: 0px 0px 16px 6px #8890b75c;
    max-width: 600px;
    max-height: 480px;
    width: 100%;
    height: 100%;
  }


  flex-row {
    width: 100%;
    align-items: center;
    justify-content: center;
  }

  h4 {
    margin: 0;
    padding: 6px 0;
  }

  :host([index="0"]) {
    margin-right: 12px;
  }
</style>
<h4>${this.title}</h4>
<flex-one></flex-one>

${map(this.items, item => html`
<flex-row>
  <span>${item.title}</span>
  <flex-one></flex-one>
  <strong>${item.value}</strong>  
</flex-row>
`)}
  `
  }
})
