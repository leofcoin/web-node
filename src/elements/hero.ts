import { CSSResultGroup, LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '@vandeurenglenn/lit-elements/typography.js'
@customElement('hero-element')
export class HeroElement extends LitElement {
  @property()
  accessor headline

  @property()
  accessor subline
  static styles?: CSSResultGroup = [
    css`
      :host {
        background: var(--active-background);
        border-radius: 24px;
        box-sizing: border-box;
        padding: 12px 24px;
        height: 100%;
        max-height: 270px;
        max-width: 320px;
        width: 100%;
        color: var(--font-color);
        border: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      h5 {
        margin: 0;
      }
    `
  ]
  protected render() {
    return html`
      <custom-typography type="headline" size="small"><span>${this.headline}</span></custom-typography>
      ${this.subline ? html`<custom-typography type="subline" size="medium">${this.subline}</custom-typography>` : ''}
      <custom-typography type="body" size="medium"><slot></slot></custom-typography>
    `
  }
}
