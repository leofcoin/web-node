import { html, LitElement } from 'lit'
import {map} from 'lit/directives/map.js'
import './info'

export default customElements.define('explorer-info-container', class ExplorerInfoContainer extends LitElement {
  static properties = {
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
    flex-direction: row;
    max-width: 600px;
    height: auto;
    height: 136px;
  }

</style>
  
${map(this.items, (item, index) => html`
  <explorer-info title=${item.title} items=${JSON.stringify(item.items)} index=${index}></explorer-info>
`)}
`
  }
})
