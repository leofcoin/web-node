import { html, css, LitElement } from 'lit'
import generateAccount from '@leofcoin/generate-account'
import IdentityController from '../controllers/identity.js'
import '@material/web/button/elevated-button.js'
import networks from '@leofcoin/networks'
import QrScanner from 'qr-scanner'
import { decrypt, encrypt } from '@leofcoin/identity-utils'
import base58 from '@vandeurenglenn/base58'
import type Client from '@leofcoin/endpoint-clients/direct'
import { customElement, property, state } from 'lit/decorators.js'
import type Chain from '@leofcoin/chain/chain'
import Router from '../router.js'
import './../elements/hero.js'

declare global {
  var client: Client
  var chain: Chain
}
@customElement('login-screen')
export class LoginScreen extends LitElement {
  @property({ type: Boolean, reflect: true })
  accessor shown: boolean
  @state()
  accessor mnemonic: string
  @property({ type: Boolean })
  accessor hasWallet: boolean
  @state()
  accessor importing: boolean
  @property()
  accessor headline
  @property()
  accessor subline

  async getIdentity() {
    if (!globalThis.walletStore) {
      if (!globalThis.LeofcoinStorage) {
        const storage = (await import('@leofcoin/storage')).default
        globalThis.LeofcoinStorage = globalThis.LeofcoinStorage || storage
      }
      globalThis.walletStore = new LeofcoinStorage('wallet')
    }
  }
  async _hasWallet() {
    const has = await globalThis.walletStore?.has('identity')
    console.log(has)

    return has as boolean
  }

  get #pages() {
    return this.shadowRoot.querySelector('custom-pages')
  }

  _keydown({ key, code, keyCode, ctrlKey, altKey, shiftKey }) {
    if (key === 'Enter') this.shadowRoot.querySelector('[data-route-action="login"]').click()
  }

  async requestLogin(hasWallet) {
    return new Promise(async (resolve, reject) => {
      this.addEventListener('keydown', this._keydown)
      this.shown = true
      this.hasWallet = await this._hasWallet()
      if (this.hasWallet) {
        this.headline = 'Welcome back!'
        this.subline = 'Enter password to unlock wallet'
      } else {
        this.headline = 'Welcome!'
        this.subline = 'Create a wallet or import one to continue'
      }
      this.shadowRoot.querySelector('input').focus()
      this.addEventListener('click', async (event) => {
        const target = event.composedPath()[0]
        const routeAction = target.dataset.routeAction
        const password = this.shadowRoot.querySelector('input').value
        try {
          if (routeAction) {
            console.log(routeAction)

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
      this.shadowRoot.querySelector('input').focus()
      this.addEventListener('click', async (event) => {
        const target = event.composedPath()[0]
        const routeAction = target.dataset.routeAction
        const password = this.shadowRoot.querySelector('input').value
        try {
          if (routeAction) {
            resolve(password)
          }
        } catch {}
      })
    })
  }

  async #handleBeforeLogin(password) {
    console.log('handle')

    this.shadowRoot.querySelector('input').value = null
    let wallet
    this.hasWallet = await this._hasWallet()
    if (!this.hasWallet && !this.importing) {
      wallet = await generateAccount(password, 'leofcoin:peach')
      globalThis.walletStore.put('identity', JSON.stringify(wallet.identity))
      globalThis.walletStore.put('accounts', JSON.stringify(wallet.accounts))
      globalThis.walletStore.put('selectedAccount', wallet.accounts[0][1])
      globalThis.walletStore.put('selectedAccountIndex', '0')
    } else if (this.hasWallet) {
      const identity = JSON.parse(await new TextDecoder().decode(await globalThis.walletStore.get('identity')))
      const accounts = JSON.parse(await new TextDecoder().decode(await globalThis.walletStore.get('accounts')))
      const selectedAccount = await new TextDecoder().decode(await globalThis.walletStore.get('selectedAccount'))
      const selectedAccountIndex = Number(
        await new TextDecoder().decode(await globalThis.walletStore.get('selectedAccountIndex'))
      )
      wallet = { identity, accounts, selectedAccount, selectedAccountIndex }
    }

    globalThis.identityController = new IdentityController('leofcoin:peach', wallet)
    console.log('handled')

    return wallet
  }

  async #handleAfterLogin(wallet) {
    document.querySelector('app-shell').wallet = wallet

    if (!customElements.get('identity-view')) await import('../views/identity.js')
    const identityView = document.querySelector('app-shell').shadowRoot.querySelector('identity-view')
    identityView.identity = wallet.identity
    identityView.accounts = wallet.accounts
    identityView.selectedAccount = wallet.selectedAccount
    identityView.selectedAccountIndex = isNaN(Number(wallet.selectedAccountIndex))
      ? wallet.accounts.filter(([name, external, internal]) => external === wallet.selectedAccount)[0]
      : wallet.selectedAccountIndex

    // this.hasWallet = await this._hasWallet()
    this.removeEventListener('keydown', this._keydown)

    if (!this.hasWallet) {
      location.hash = Router.bang('identity/dashboard')
    }
    document.querySelector('app-shell').navRailShown = true
    pubsub.publish('identity-change', {
      accounts: wallet.accounts,
      selectedAccount: wallet.selectedAccount,
      selectedAccountIndex: wallet.selectedAccountIndex
    })
  }

  #iUnderstand = () => {
    this.removeAttribute('shown')
  }

  async #handleCreate(password) {
    const wallet = await this.#handleBeforeLogin(password)
    this.headline = 'Created Wallet!'
    this.subline = 'Make sure to backup your password and mnemonic'
    this.#pages.select('create')
    try {
      await globalThis.identityController.unlock(password)
      await this.#handleAfterLogin(wallet)

      this.loadChain(password)
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  #waitForKey = () =>
    new Promise((resolve, reject) => {
      const importSection = this.shadowRoot.querySelector('[data-route="import"]')

      const _onImport = (result) => {
        resolve(importSection.querySelector('input').value)

        importSection.querySelector('md-elevated-button').removeEventListener('click', _onImport)
      }
      importSection.querySelector('md-elevated-button').addEventListener('click', _onImport)
      new QrScanner(this.shadowRoot.querySelector('video'), (decoded) => {
        importSection.querySelector('input').value = decoded
      })
    })

  async #handleImport(password) {
    this.importing = true
    this.#pages.select('import')
    this.headline = 'Import Wallet!'
    this.subline = 'Scan qr code or putin multiWIF'
    const encrypted = await this.#waitForKey()
    try {
      const identityController = new IdentityController('leofcoin:peach')

      let wallet = await identityController.import(password, encrypted)
      const multiWIF = new Uint8Array(await encrypt(password, await wallet.multiWIF))

      const external = await wallet.account(1).external(1)
      const externalAddress = await external.address
      const internal = await wallet.account(1).internal(1)
      const internalAddress = await internal.address

      wallet = {
        identity: {
          multiWIF: base58.encode(multiWIF),
          walletId: await external.id
        },
        accounts: [['main account', externalAddress, internalAddress]]
      }
      globalThis.walletStore.put('identity', JSON.stringify(wallet.identity))
      globalThis.walletStore.put('accounts', JSON.stringify(wallet.accounts))
      globalThis.walletStore.put('selectedAccount', wallet.accounts[0][1])
      globalThis.walletStore.put('selectedAccountIndex', '0')
    } catch (error) {
      console.error(error)
      alert(error)
    }
  }

  async #spawnChain(password) {
    console.time('loading chain')
    let importee
    importee = await import('../../node_modules/@leofcoin/chain/exports/browser/node-browser.js')
    await new importee.default(
      {
        network: 'leofcoin:peach',
        networkName: 'leofcoin:peach',
        networkVersion: 'peach',
        stars: networks.leofcoin.peach.stars,
        autoStart: false
      },
      password
    )

    importee = await import('@leofcoin/lib/node-config')
    const config = await importee.default()

    importee = await import('./../../node_modules/@leofcoin/chain/exports/browser/chain.js')
    globalThis.chain = await new importee.default({ resolveTimeout: 30_000 })
    console.log(chain)
    console.timeEnd('loading chain')
    this.#spawnEndpoint()
    // await globalThis.client.init()
  }

  async #spawnEndpoint(direct = true) {
    let importee
    if (direct) {
      importee = await import('@leofcoin/endpoint-clients/direct')
      globalThis.client = await new importee.default('wss://ws-remote.leofcoin.org', 'peach')
    } else {
      importee = await import('@leofcoin/endpoint-clients/ws')
      globalThis.client = await new importee.default('wss://ws-remote.leofcoin.org', 'peach')
      // @ts-ignore
      globalThis.client.init && (await globalThis.client.init())
    }
  }

  async loadChain(password, direct = true) {
    if (globalThis.chain) return
    try {
      if (direct) await this.#spawnChain(password)
      else await this.#spawnEndpoint(false)
    } catch (error) {
      console.log(error)
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
      console.error(e)
      throw e
    }
  }
  get #defaultTemplate() {
    return html`
      <input type="password" placeholder="password" tabindex="0" autofocus autocomplete="new-password" />
      <flex-it></flex-it>
      <flex-row>
        <button data-route-action="import">import</button>
        <flex-it></flex-it>
        <button data-route-action="create">create</button>
      </flex-row>
    `
  }

  get #hasWalletTemplate() {
    return html`
      <input type="password" placeholder="password" tabindex="0" autofocus autocomplete="current-password" />
      <flex-it></flex-it>
      <button data-route-action="login" style="width: 100%; max-width: 190px; margin-bottom: 12px;">login</button>
    `
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
      transition: 0.25s;
      z-index: -1;
    }

    :host([shown]) {
      opacity: 1;
      pointer-events: auto;
      z-index: 1002;
      transition: 0.25s;
    }

    input,
    button {
      border-color: white;
      padding: 10px;
      border-radius: 12px;
      box-sizing: border-box;
      pointer-events: auto;
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

    button:hover {
      background: var(--secondary-background);
      transition: 0.25s;
    }

    custom-pages {
      width: 100%;
      height: 100%;
    }

    span[data-route='login'] {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
    }
  `

  render() {
    return html`
      <hero-element .headline=${this.headline} .subline=${this.subline}>
        <custom-pages attr-for-selected="data-route">
          <flex-column data-route="login" center>
            <flex-it flex="2"></flex-it>
            ${this.hasWallet ? this.#hasWalletTemplate : this.#defaultTemplate}
          </flex-column>

          <flex-column data-route="create">
            <flex-it flex="2"></flex-it>
            ${this.mnemonic}

            <md-elevated-button @click=${this.#iUnderstand}>I Understand</md-elevated-button>
          </flex-column>

          <flex-column data-route="import">
            <flex-column data-route="qr">
              <video></video>
            </flex-column>

            <input type="password" placeholder="multiwif" tabindex="0" autofocus autocomplete="new-password" />

            <md-elevated-button>import</md-elevated-button>
          </flex-column>
        </custom-pages>
      </hero-element>
    `
  }
}
