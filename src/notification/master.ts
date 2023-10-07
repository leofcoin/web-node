import { css, html, LitElement } from "lit";
import './child.js'

export default customElements.define('notification-master', class NotificationMaster extends LitElement {
  constructor() {
    super()
  }

  get hasMoreThenOneChild() {
    return this.childElementCount > 1
  }

  static styles = css`:host {
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    z-index: 10001;
    position: fixed;
    top: 12px;
    right: 12px;
  }`

  createNotification({title, message}) {
    const notification = document.createElement('notification-child')
    notification.title = title
    notification.message = message
    this.appendChild(notification)
    if (this.hasMoreThenOneChild) this.requestUpdate()
  }

  #onclick() {
    console.log('cl');
  }

  render() {
    return html`
    <slot></slot>

    ${this.hasMoreThenOneChild ? html`<custom-svg-icon icon="close" @click="${this.#onclick}"></custom-svg-icon>` : ''}
    `
  }
})