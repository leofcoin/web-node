import { LitElement, PropertyValueMap, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('sync-info')
export class SyncInfo extends LitElement {
  @property({ type: Boolean })
  open: boolean = false

  @property({ type: Number })
  lastBlockIndex = 0

  @property({ type: Number })
  totalResolved = 0

  @property({ type: Number })
  totalLoaded = 0

  @property({ type: Boolean, reflect: true })
  animating

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has('totalResolved') || _changedProperties.has('totalLoaded')) {
      if (this.totalResolved === 0) return
      this.animating = true
      if (this.timeout) clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.animating = false
      }, 500)
    }
  }
  static styles = [
    css`
      custom-icon {
        position: absolute;
        top: 12px;
        right: 48px;
        cursor: pointer;
        pointer-events: auto;
        z-index: 10001;
      }
      custom-dropdown {
        top: 44px;
        right: 48px;
        color: #eee;
      }

      :host([animating]) custom-icon {
        animation-name: spin;
        animation-duration: 4000ms;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `
  ]
  protected render(): unknown {
    return html`
      <custom-icon icon="sync" @click=${() => (this.open = !this.open)}></custom-icon>
      <custom-dropdown .open=${this.open}>
        <flex-row>
          <strong style="margin-right: 3px">resolved</strong>
          <span> ${this.totalResolved} </span>
          <strong style="margin: 0 3px">of</strong>

          <span>${this.lastBlockIndex} </span>
        </flex-row>
        <flex-row>
          <strong style="margin-right: 3px">loaded</strong>
          <span> ${this.totalLoaded} </span>
          <strong style="margin: 0 3px">of</strong>

          <span>${this.lastBlockIndex} </span>
        </flex-row>
      </custom-dropdown>
    `
  }
}
