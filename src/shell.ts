import Pubsub from '@vandeurenglenn/little-pubsub'
import Storage from '@leofcoin/storage'
import '@vandeurenglenn/lit-elements/pages.js'
import '@vandeurenglenn/lit-elements/selector.js'
import './array-repeat.js'
import './screens/login.js'
import './screens/export.js'
import './screens/touchpay.js'
import './clipboard-copy.js'
import './screens/login.js'
import './notification/master.js'
import './notification/child.js'
import './elements/account-select.js'
import defaultTheme from './themes/default.js'
import { walletContext, Wallet } from './context/wallet.js'
import { customElement, property, query } from 'lit/decorators.js'
import { LitElement, css, html } from 'lit'
import { Block, blockContext } from './context/block.js'
import { ContextProvider } from '@lit/context'
import '@vandeurenglenn/lit-elements/icon-set.js'
import '@vandeurenglenn/lit-elements/icon.js'
import '@vandeurenglenn/lit-elements/dropdown-menu.js'
import '@vandeurenglenn/flex-elements/column.js'
import '@vandeurenglenn/flex-elements/row.js'
import '@vandeurenglenn/flex-elements/it.js'
import '@vandeurenglenn/lit-elements/theme.js'
import './elements/sync-info.js'

globalThis.pubsub = globalThis.pubsub || new Pubsub(true)

const setTheme = (theme) => {
  for (const key of Object.keys(theme)) {
    document.querySelector('body').style.setProperty(`--${key}`, theme[key])
  }
}

setTheme(defaultTheme)

@customElement('app-shell')
class AppShell extends LitElement {
  @property({ type: Boolean })
  openSync: boolean = false

  @property({ type: Number })
  lastBlockIndex = 0

  @property({ type: Number })
  totalResolved = 0

  @property({ type: Number })
  totalLoaded = 0

  #blockContextProvider = new ContextProvider(this, { context: blockContext })
  #walletContextProvider = new ContextProvider(this, {
    context: walletContext
  })

  set block(value: Block) {
    this.#blockContextProvider.setValue(value)
    this.#blockContextProvider.updateObservers()
  }

  set wallet(value: Wallet) {
    this.#walletContextProvider.setValue(value)
    this.#walletContextProvider.updateObservers()
  }

  #nodeReady = new Promise((resolve) => {
    pubsub.subscribe('node:ready', () => resolve(true))
  })

  get notificationMaster() {
    return this.renderRoot.querySelector('notification-master')
  }
  get #pages() {
    return this.shadowRoot.querySelector('custom-pages')
  }

  select(selected) {
    this.#select(selected)
  }

  async #select(selected) {
    if (!customElements.get(`${selected}-view`)) await import(`./${selected}.js`)
    this.#pages.select(selected)
    const monacoContainer = document.querySelector('.container')
    if (monacoContainer) {
      if (selected === 'editor') monacoContainer.classList.add('custom-selected')
      else monacoContainer.classList.remove('custom-selected')
    }
  }

  #onhashchange = async () => {
    const parts = location.hash.split('/')
    let params = parts[1].split('?')
    const selected = params[0]

    const object = {}
    if (params.length > 1) {
      params = params[1].split('&')
      for (let param of params) {
        param = param.split('=')
        object[param[0]] = param[1]
      }
    }

    if (selected === 'wallet') await this.#nodeReady

    if (object.address) {
      await this.#nodeReady
      document.querySelector('app-shell').renderRoot.querySelector('touchpay-screen').checkChanges(object.address, object.amount)
    }

    console.log(selected, object)
    selected && (await this.#select(selected))

    const explorerView = this.shadowRoot.querySelector('explorer-view')

    if (selected === 'explorer' && object.block !== undefined) {
      await this.shadowRoot.querySelector('explorer-view').select('block')
      await this.#nodeReady

      this.block = await client.getBlock(object.index)
      console.log(this.block)
    }

    if (selected === 'explorer' && object.blockTransactions !== undefined) {
      await this.shadowRoot.querySelector('explorer-view').select('block-transactions')
      explorerView.renderRoot.querySelector('explorer-block-transactions').updateInfo(object.block, object.index)
    }
    if (selected === 'explorer' && object.transaction !== undefined) {
      await this.shadowRoot.querySelector('explorer-view').select('transaction')
      explorerView.renderRoot.querySelector('explorer-transaction').updateInfo(object.blockIndex, object.index)
    }
    if (selected === 'explorer' && object.selected) {
      await this.shadowRoot.querySelector('explorer-view').select(object.selected)
    }
    if (selected === 'explorer' && Object.keys(object).length === 0) {
      location.hash = '#!/explorer?selected=dashboard'
    }

    const identityView = this.shadowRoot.querySelector('identity-view')

    if (selected === 'identity' && object.account !== undefined) {
      await this.shadowRoot.querySelector('identity-view').select('account')
      identityView.renderRoot.querySelector('identity-account').updateInfo(object.account)
    }
    if (selected === 'identity' && object.selected) {
      await this.shadowRoot.querySelector('identity-view').select(object.selected)
    }
    if (selected === 'identity' && Object.keys(object).length === 0) {
      location.hash = '#!/identity?selected=dashboard'
    }
  }

  @query('sync-info')
  syncInfo

  @property({ type: Boolean, reflect: true, attribute: 'is-desktop' })
  isDesktop: boolean = false

  #matchMedia = ({ matches }) => {
    this.isDesktop = matches
    document.dispatchEvent(new CustomEvent('is-desktop', { detail: matches }))
  }

  async connectedCallback() {
    super.connectedCallback()

    var matchMedia = window.matchMedia('(min-width: 640px)')
    this.#matchMedia(matchMedia)
    matchMedia.onchange = this.#matchMedia(matchMedia)

    this.peersConnected = 0
    pubsub.subscribe('lastBlock', (block) => (this.syncInfo.lastBlockIndex = block.index))
    pubsub.subscribe('block-resolved', (block) => (this.syncInfo.totalResolved += 1))
    pubsub.subscribe('block-loaded', (block) => (this.syncInfo.totalLoaded += 1))
    try {
      let importee
      importee = await import('@leofcoin/endpoint-clients/ws')
      globalThis.client = await new importee.default('wss://ws-remote.leofcoin.org', 'peach')
      console.log(client)

      // @ts-ignore
      globalThis.client.init && (await globalThis.client.init())
    } catch (error) {
      console.error(error)
    }

    onhashchange = this.#onhashchange
    if (location.hash.split('/')[1]) this.#onhashchange()
    else this.#select('wallet')

    await this.#login()
    // await this.init()
    // globalThis.walletStorage = new Storage('wallet')
    // await globalThis.walletStorage.init()
    // lo
  }

  async #login() {
    if (!globalThis.walletStore) {
      const importee = await import('@leofcoin/storage')
      // todo: race condition introduced?
      // for some reason walletStore can't find current wallet
      globalThis.walletStore = globalThis.walletStore || (await new Storage('wallet', '.leofcoin/peach'))
      await walletStore.init()
    }

    const hasWallet = await walletStore.has('identity')
    console.log(hasWallet)

    await this.shadowRoot.querySelector('login-screen').requestLogin(hasWallet)
  }

  static styles = [
    css`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100;0,300;0,400;0,600;0,700;0,800;1,300;1,400&display=swap');

      :host {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        font-family: system-ui, 'Noto Sans', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
          'Segoe UI Symbol';

        background: linear-gradient(45deg, #6495ed78, transparent);
        background: var(--main-background);
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.5;
      }

      .main {
        height: 100%;
      }

      custom-selector {
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: var(--secondary-background);
      }

      .custom-selector-overlay {
        height: 100%;
        background: #333750;
        --svg-icon-color: #ffffffb5;
        border-right: 1px solid #383941;
      }

      a {
        padding: 12px;
        box-sizing: border-box;
        height: 48px;
      }

      flex-column {
        width: 100%;
        height: 100%;
      }

      header {
        height: 64px;
        display: flex;
        align-items: center;
        width: 100%;
        box-sizing: border-box;
        padding: 6px 12px;
      }

      ::slotted(.container) {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }

      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.3);
        -webkit-box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.3);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb {
        border-radius: 10px;
        box-shadow: inset 0 0 6px rgba(225, 255, 255, 0.5);
        -webkit-box-shadow: inset 0 0 6px rgba(225, 255, 255, 0.5);
      }

      .resolver-snack,
      .loader-snack {
        color: var(--font-color);
      }
    `
  ]
  render() {
    return html`
      <custom-icon-set>
        <template>
          <span name="close">@symbol-close</span>
          <span name="notifications">@symbol-notifications</span>
          <span name="sync">@symbol-sync</span>
          <span name="clear-all">@symbol-clear_all</span>
          <span name="wallet">@symbol-wallet</span>
          <span name="send">@symbol-send</span>
          <span name="account_circle">@symbol-account_circle</span>
          <span name="travel_explore">@symbol-travel_explore</span>
          <span name="gavel">@symbol-gavel</span>
          <span name="edit_note">@symbol-edit_note</span>
          <span name="analytics">@symbol-analytics</span>
          <span name="chat">@symbol-chat</span>
          <span name="database">@symbol-database</span>
          <span name="history">@symbol-history</span>
          <span name="mood">@symbol-mood</span>
          <span name="local-florist">@symbol-local_florist</span>
          <span name="local-pizza">@symbol-local_pizza</span>
          <span name="directions-walk">@symbol-directions_walk</span>
          <span name="input_circle">@symbol-input_circle</span>
          <span name="cake">@symbol-cake</span>
          <span name="account-balance">@symbol-account_balance</span>
          <span name="euro-symbol">@symbol-euro_symbol</span>
          <span name="flags">@symbol-emoji_flags</span>
          <span name="people">@symbol-emoji_people</span>
          <span name="gif">@symbol-gif</span>
          <span name="list">@symbol-list_alt</span>
          <span name="call_received">@symbol-call_received</span>
          <span name="call_made">@symbol-call_made</span>
        </template>
      </custom-icon-set>
      <custom-theme load-symbols="false"></custom-theme>
      <flex-row class="main">
        <span class="custom-selector-overlay">
          <custom-selector attr-for-selected="data-route">
            <a href="#!/wallet" data-route="wallet">
              <custom-icon icon="wallet"></custom-icon>
            </a>
            <a href="#!/identity" data-route="identity">
              <custom-icon icon="account_circle"></custom-icon>
            </a>
            <a href="#!/explorer" data-route="explorer">
              <custom-icon icon="travel_explore"></custom-icon>
            </a>
            <a href="#!/validator" data-route="validator">
              <custom-icon icon="gavel"></custom-icon>
            </a>
            <a href="#!/editor" data-route="editor">
              <custom-icon icon="edit_note"></custom-icon>
            </a>
            <a href="#!/chat" data-route="chat">
              <custom-icon icon="chat"></custom-icon>
            </a>
            <a href="#!/database" data-route="database">
              <custom-icon icon="database"></custom-icon>
            </a>
            <a href="#!/stats" data-route="stats">
              <custom-icon icon="analytics"></custom-icon>
            </a>
          </custom-selector>
        </span>

        <flex-column>
          <header>
            <flex-it></flex-it>
            <account-select style="margin-right: 48px;"></account-select>

            <notification-master></notification-master>
          </header>
          <custom-pages attr-for-selected="data-route">
            <identity-view data-route="identity"></identity-view>
            <wallet-view data-route="wallet"></wallet-view>
            <explorer-view data-route="explorer"></explorer-view>
            <validator-view data-route="validator"></validator-view>
            <editor-view data-route="editor"><slot></slot></editor-view>
            <stats-view data-route="stats"></stats-view>
            <chat-view data-route="chat" ?is-desktop=${this.isDesktop}></chat-view>
          </custom-pages>
        </flex-column>
      </flex-row>

      <login-screen></login-screen>
      <export-screen></export-screen>
      <touchpay-screen></touchpay-screen>

      <sync-info></sync-info>
    `
  }
}
export default AppShell
