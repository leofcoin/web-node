import { html, LitElement } from "lit";
import generateAccount from '@leofcoin/generate-account'
import IdentityController from './../controllers/identity.js'

export default customElements.define('login-screen', class LoginScreen extends LitElement {
  static properties = {
    shown: {
      type: 'boolean',
      reflect: true
    },
    mnemonic: {
      type: 'string'
    },
    hasWallet: {
      type: 'boolean'
    }
  }

  async _hasWallet() {
    const has = await globalThis.walletStorage?.has('identity')
    return has
  }

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
  }

  get #pages() {
    return this.renderRoot.querySelector('custom-pages')
  }

  async requestLogin(hasWallet) {
    return new Promise(async (resolve, reject) => {
      this.shown = true
      this.hasWallet = await this._hasWallet()
      this.renderRoot.querySelector('input').focus()
      this.addEventListener('click', async (event) => {
        const target = event.composedPath()[0]
        const routeAction = target.dataset.routeAction
        const password = this.renderRoot.querySelector('input').value
        try {
          if (routeAction) {
            if (routeAction === 'create') await this.#handleCreate(password)
            if (routeAction === 'import') await this.#handleImport(password)
            if (routeAction === 'login') await this.#handleLogin(password)
            resolve()
          }
        } catch {}
      })
    })
  }

  async requestPassword(hasWallet) {
    return new Promise(async (resolve, reject) => {
      this.shown = true
      this.renderRoot.querySelector('input').focus()
      this.addEventListener('click', async (event) => {
        const target = event.composedPath()[0]
        const routeAction = target.dataset.routeAction
        const password = this.renderRoot.querySelector('input').value
        try {
          if (routeAction) {
            resolve(password)
          }
        } catch {}
      })
    })
  }

  async #handleBeforeLogin(password) {
    this.renderRoot.querySelector('input').value = null
    let wallet
    this.hasWallet = await this._hasWallet()
    if (!this.hasWallet && !this.importing) {
      wallet = await generateAccount(password, 'leofcoin:peach')
      globalThis.walletStorage.put('identity', JSON.stringify(wallet.identity))
      globalThis.walletStorage.put('accounts', JSON.stringify(wallet.accounts))
    } else if (this.hasWallet) {
      const identity = JSON.parse(await new TextDecoder().decode(await globalThis.walletStorage.get('identity')))
      const accounts = JSON.parse(await new TextDecoder().decode(await globalThis.walletStorage.get('accounts')))
      wallet = {identity, accounts}
    }

    globalThis.identityController = new IdentityController('leofcoin:peach', wallet)
    return wallet
  }

  async #handleAfterLogin(wallet) {
    if (!customElements.get('identity-view')) await import('../views/identity.js')
    const identityView = document.querySelector('app-shell').renderRoot.querySelector('identity-view')
    identityView.identity = wallet.identity
    identityView.accounts = wallet.accounts
    identityView.selectedAccount = wallet.accounts[0][1]

    // this.hasWallet = await this._hasWallet()
    if (!this.hasWallet) {
      document.querySelector('app-shell').select('identity')
    }
  }

  async #handleCreate(password) {
    const wallet = await this.#handleBeforeLogin(password)
    try {
      await globalThis.identityController.unlock(password)
      await this.#handleAfterLogin(wallet)
      this.removeAttribute('shown')
    } catch (e) {
      console.error(e);
      throw e
    }
  }

  #handleImport() {
    this.importing = true
    if (!this.hasWallet()) {

    }
  }

  async #handleLogin(password) {

    const wallet = await this.#handleBeforeLogin(password)
    try {

      await globalThis.identityController.unlock(password)
      await this.#handleAfterLogin(wallet)
      this.removeAttribute('shown')
    } catch (e) {
      console.error(e);
      throw e
    }
  }
  get #defaultTemplate() {
    return html`
      <h4>Login</h4>
      <h5>Create a wallet or import one to continue</h5>
      <flex-two></flex-two>
      <input type="password" placeholder="password" tabindex="0" autofocus autocomplete="password webauthn">
      <flex-one></flex-one>
      <flex-row>
        <button data-route-action="import">import</button>
        <flex-one></flex-one>
        <button data-route-action="create">create</button> 
      </flex-row>`
  }

  get #hasWalletTemplate() {
    return html`
      <h4>Login</h4>
      <h5>Enter password to unlock wallet</h5>
      <flex-two></flex-two>
      <input type="password" placeholder="password" tabindex="0" autofocus autocomplete="password webauthn">
      <flex-one></flex-one>
      <button data-route-action="login">login</button>`
  }

  render() {
    return html`
    <style>
      :host {
        display: flex;
        flex-direction: column;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        position: absolute;
        background: radial-gradient(#351fdc, transparent), radial-gradient(#628ed2, transparent);;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        opacity: 0;
      }

      :host([shown]) {
        opacity: 1;
        pointer-events: auto;
        z-index: 1000;
      }

      .wrapper {
        background: #3647bd;
        border-radius: 12px;
        box-sizing: border-box;
        padding: 12px 24px;
        height: 100%;
        max-height: 240px;
        max-width: 320px;
        width: 100%;
        color: white;
        box-shadow: 1px 1px 6px 8px #475ad96b, 1px 1px 6px 5px #475ad96b;
      }

      input, button {
        border-color: white;
        padding: 10px;
        border-radius: 12px;
        box-sizing: border-box;
      }

      button {
        background: #12b8e4a3;
        color: white;
        border-color: white;
        background: transparent;
        padding: 10px 20px;
      }
      
      h5 {
        margin: 0;
      }

      custom-pages {
        width: 100%;
        height: 100%;
      }

      span[data-route="login"] {
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
      }
      .word {
        display: inline-flex;
        padding: 6px;
        border-radius: 3px;
        background: #fff;
        color: #333;
      }
    </style>

    <flex-column class="wrapper">   
      <custom-pages attr-for-selected="data-route">
        <flex-column data-route="login">
        ${this.hasWallet ?  this.#hasWalletTemplate : this.#defaultTemplate}
        </flex-column>

        <flex-column data-route="create">
          ${this.mnemonic}
        </flex-column>

        <flex-column data-route="import">
          
        </flex-column>
      </custom-pages>
    </flex-column>    
    `
  }
})