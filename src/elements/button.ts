import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('button-element')
class ButtonElement extends LitElement {
  render = () => html`<button><slot></slot></button>`;
  
  static styles = css`
    :host {
      display: contents;
    }
    button {
      cursor: pointer;
      border-radius: 12px;
      box-sizing: border-box;
      padding: 6px 12px;
      pointer-events: auto;
    }`;
}
