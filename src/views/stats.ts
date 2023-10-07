import { version } from '../../package.json'
import '../elements/shorten-string.js'

export default customElements.define('stats-view', class StatsView extends HTMLElement {

  constructor() {
    super()

    this.attachShadow({mode: 'open'})
    this.shadowRoot.innerHTML = this.template
    this.peers = []
  }

  #peerConnected(peer) {
    if (this.peers.indexOf(peer) !== -1) return
    const el = document.createElement('flex-row')
    el.setAttribute('address', peer)
    el.innerHTML = peer
    this.shadowRoot.querySelector('.peers-container').appendChild(el)
    this.peers.push(peer)
    this.shadowRoot.querySelector('.peers').innerHTML = Number(this.shadowRoot.querySelector('.peers').innerHTML) + 1
  }

  #peerLeft(peer) {
    const index = this.peers.indexOf(peer)
    if (index === -1) return

    this.peers.splice(index)
    this.shadowRoot.removeChild(this.shadowRoot.querySelector(`[address="${peer}"]`))
    this.shadowRoot.querySelector('.peers').innerHTML = Number(this.shadowRoot.querySelector('.peers').innerHTML) - 1
  }

  async connectedCallback() {
    this.shadowRoot.querySelector('.peerId').value = await client.peerId()
    const peers = await client.peers()
    peers.forEach(peer => {
      this.#peerConnected(peer)
    })

    pubsub.subscribe('peer:connected', this.#peerConnected.bind(this))
    pubsub.subscribe('peer:left', this.#peerLeft.bind(this))
  }

  get template() {
    return `
<style>
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    color: var(--font-color);
  }


  .bottom-bar {
    align-items: center;
    height: 48px;
  }

  flex-row {
    width: 100%;
    align-items: center;
  }

  flex-column {
    max-width: 640px;
    max-height: 480px;
    width: 100%;
    height: 100%;
  }

  .peers-container {
    padding-top: 24px;
  }

  .version {
    padding: 12px 0;
  }

  .container {
    max-width: 320px;
    width: 100%;
    background: var(--secondary-background);
    border: 1px solid var(--border-color);
    padding: 12px 24px;
    box-sizing: border-box;
    border-radius: 24px;
  }
</style>

<flex-column class="container">
  <flex-row class="id">
    <strong>id</strong>
    <flex-one></flex-one>
    <shorten-string class="peerId"></shorten-string>
  </flex-row>
  <flex-row class="version">
    <strong>version</strong>
    <flex-one></flex-one>
    <span class="version">${version}</span>
  </flex-row>
  <flex-row>
    <strong>peers</strong>
    <flex-one></flex-one>
    <span class="peers">0</span>
  </flex-row>

  <flex-column class="peers-container"></flex-column>
</flex-column>
    `
  }
})
