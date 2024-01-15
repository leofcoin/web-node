import { LitElement, PropertyValueMap, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../elements/shorten-string.js'
// import { map } from 'lit/directives/map.js'
import './../elements/emoji-selector.js'

@customElement('chat-view')
export class ChatView extends LitElement {
  @property({ type: Array })
  peers: [string, {}][] = []

  @property({ type: String })
  peerId: string

  #peerChange = async (peer) => {
    this.peers = await client.peers()
  }

  async connectedCallback() {
    super.connectedCallback()
    // this.shadowRoot.querySelector('.peerId').value = await client.peerId()
    this.peers = await client.peers()
    this.peerId = await client.peerId()
    pubsub.subscribe('peer:connected', this.#peerChange)
    pubsub.subscribe('peer:left', this.#peerChange)
  }

  static get styles() {
    return [
      css`
        :host {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          color: var(--font-color);
        }
        .chat-container {
          height: 100%;
        }
        textarea {
          padding-top: 12px;
          width: 100%;
          border: none;
          resize: none;
          outline: none;
          background: transparent;
          font-size: 16px;
        }

        .input-container {
          box-sizing: border-box;
          border-top: 1px solid #eee;
          padding: 12px;
          box-sizing: border-box;
          min-height: 48px;
        }
      `
    ]
  }

  render() {
    // return html`
    //   <flex-column class="chat-container">
    //     <array-repeat>
    //       <template>
    //         <chat-message></chat-message>
    //       </template>
    //     </array-repeat>
    //   </flex-column>

    //   <flex-column>
    //     <custom-pages>
    //       <emoji-selector data-route="emoji"></emoji-selector>
    //     </custom-pages>

    //     <flex-row>
    //       <custom-tabs>
    //         <custom-tab data-route="emoji" title="emoji"><custom-icon icon="mood"></custom-icon></custom-tab>
    //         <custom-tab data-route="gif" title="gif"><custom-icon icon="gif"></custom-icon></custom-tab>
    //       </custom-tabs>
    //     </flex-row>
    //     <textarea placeholder="type here"></textarea>
    //   </flex-column>
    // `
    return html`
      <flex-column class="chat-container">
        <array-repeat>
          <template>
            <chat-message></chat-message>
          </template>
        </array-repeat>
      </flex-column>

      <flex-column>
        <emoji-selector data-route="emoji"></emoji-selector>
        <flex-row width="100%" center class="input-container">
          <textarea placeholder="type here"></textarea>
          <custom-icon icon="send"> </custom-icon>
        </flex-row>
      </flex-column>
    `
  } 
}
