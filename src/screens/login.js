import { html, css, LitElement } from "lit";
import generateAccount from '@leofcoin/generate-account'
import IdentityController from '../controllers/identity.js'
import '@material/web/button/elevated-button.js'
import networks from '@leofcoin/networks'


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

  _keydown({key, code, keyCode, ctrlKey, altKey, shiftKey}) {
    if (key === 'Enter') this.renderRoot.querySelector('[data-route-action="login"]').click()
  }

  async requestLogin(hasWallet) {
    return new Promise(async (resolve, reject) => {
      this.addEventListener('keydown', this._keydown)
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
      this.addEventListener('keydown', this._keydown)
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
      globalThis.walletStorage.put('selectedAccount', wallet.accounts[0][1])
      globalThis.walletStorage.put('selectedAccountIndex', '0')
    } else if (this.hasWallet) {
      const identity = JSON.parse(await new TextDecoder().decode(await globalThis.walletStorage.get('identity')))
      const accounts = JSON.parse(await new TextDecoder().decode(await globalThis.walletStorage.get('accounts')))
      const selectedAccount = await new TextDecoder().decode(await globalThis.walletStorage.get('selectedAccount'))
      const selectedAccountIndex = Number(await new TextDecoder().decode(await globalThis.walletStorage.get('selectedAccountIndex')))
      wallet = {identity, accounts, selectedAccount, selectedAccountIndex}
    }

    globalThis.identityController = new IdentityController('leofcoin:peach', wallet)
    return wallet
  }

  async #handleAfterLogin(wallet) {
    if (!customElements.get('identity-view')) await import('../views/identity.js')
    const identityView = document.querySelector('app-shell').renderRoot.querySelector('identity-view')
    identityView.identity = wallet.identity
    identityView.accounts = wallet.accounts
    identityView.selectedAccount = wallet.selectedAccount
    identityView.selectedAccountIndex = isNaN(Number(wallet.selectedAccountIndex)) ?
      wallet.accounts.filter(([name, external, internal]) => external === wallet.selectedAccount)[0] :
      wallet.selectedAccountIndex

    // this.hasWallet = await this._hasWallet()
    this.removeEventListener('keydown', this._keydown)

    if (!this.hasWallet) {
      document.querySelector('app-shell').select('identity')
    }

    pubsub.publish('identity-change', {
      accounts: wallet.accounts,
      selectedAccount: wallet.selectedAccount,
      selectedAccountIndex: wallet.selectedAccountIndex
    })
  }

  async #handleCreate(password) {
    const wallet = await this.#handleBeforeLogin(password)
    try {
      await globalThis.identityController.unlock(password)
      await this.#handleAfterLogin(wallet)
      this.removeAttribute('shown')
      this.loadChain(password)
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

  async #spawnChain(password) {
    let importee
    importee = await import('./../../node_modules/@leofcoin/chain/exports/browser/node-browser.js')
    await new importee.default({
      network: 'leofcoin:peach',
      networkName: 'leofcoin:peach',
      networkVersion: 'peach',
      stars: networks.leofcoin.peach.stars,
      autoStart: false
    },
    password)

    importee = await import('./../../node_modules/@leofcoin/lib/exports/node-config.js')
    const config = await importee.default()

    importee = await import('./../../node_modules/@leofcoin/chain/exports/browser/chain.js')
    globalThis.chain = await new importee.default()
    console.log(chain);

    this.#spawnEndpoint()
    // await globalThis.client.init()
  }

  async #spawnEndpoint(direct = true) {
    let importee
    if (direct) {
      importee = await import('./../../node_modules/@leofcoin/endpoint-clients/exports/direct.js')
      globalThis.client = await new importee.default('wss://ws-remote.leofcoin.org', 'peach')
    } else {
      importee = await import('./../../node_modules/@leofcoin/endpoint-clients/exports/ws.js')
      globalThis.client = await new importee.default('wss://ws-remote.leofcoin.org', 'peach')
      await globalThis.client.init()  
    }
    
  }

  async loadChain(password, direct = true) {
    let importee
    try {
      if (direct) {
        await this.#spawnChain(password)
      }
      await this.#spawnEndpoint(false)
    } catch (error) {
      console.log(error);
      this.#spawnEndpoint(false)
    }
  }

  async #handleLogin(password) {

    const wallet = await this.#handleBeforeLogin(password)
    try {

      await globalThis.identityController.unlock(password)
     
      await this.#handleAfterLogin(wallet)
      this.removeAttribute('shown')
      this.loadChain(password)
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
      <input type="password" placeholder="password" tabindex="0" autofocus autocomplete="new-password">
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
      <input type="password" placeholder="password" tabindex="0" autofocus autocomplete="current-password">
      <flex-one></flex-one>
      <button data-route-action="login">login</button>`
  }

  static styles = css`
  :host {
    display: flex;
    flex-direction: column;
    inset: 0;
    position: absolute;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    opacity: 0;
    background: #1116;
  }

  :host([shown]) {
    opacity: 1;
    pointer-events: auto;
    z-index: 1002;
  }

  .wrapper {
    background: var(--active-background);
    border-radius: 12px;
    box-sizing: border-box;
    padding: 12px 24px;
    height: 100%;
    max-height: 240px;
    max-width: 320px;
    width: 100%;
    color: var(--font-color);
    border: 1px solid var(--border-color);
  }

  input, button {
    border-color: white;
    padding: 10px;
    border-radius: 12px;
    box-sizing: border-box;
  }

  input {
    font-size: 16px;
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
  `

  render() {
    return html`

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