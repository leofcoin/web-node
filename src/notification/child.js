import { css, html, LitElement } from "lit";

export default customElements.define('notification-child', class NotificationChild extends LitElement {
  constructor() {
    super()
  }

  static properties = {
    title: {
      type: String
    },
    message: {
      type: String
    },
    type: {
      type: String,
      reflect: true
    }
  }

  static styles = css`:host {
    display: flex;
    flex-direction: column;
    font-size: 13px;
    border: 1px solid;
    border-radius: 12px;
    padding: 6px 12px;
    box-sizing: border-box;
    background: #fff;

    --svg-icon-size: 20px;
  }
  flex-row {
    height: 24px;
    box-sizing: border-box;
    align-items: center;
  }

  strong {
    font-size: 14px;
  }
  `

  render() {
    return html`
  <flex-row>
    <strong>${this.title}</strong>
    <flex-one></flex-one>
    <custom-svg-icon icon="close"></custom-svg-icon>
  </flex-row>

  <p>${this.message}</p>
    `
  }
})