import Pubsub from '@vandeurenglenn/little-pubsub'
import Storage from '@leofcoin/storage'
import '@vandeurenglenn/custom-elements/pages.js'
import 'custom-selector/src/index.js'
import 'custom-svg-iconset'
import 'custom-svg-icon'
import './array-repeat.js'
import './screens/login.js'
import './screens/export.js'
import './clipboard-copy.js'
import './screens/login.js'
import './notification/master.js'
import './notification/child.js'
import './elements/account-select.js'
import defaultTheme from './themes/default.js'
import { provide } from '@lit-labs/context'
import { walletContext, Wallet } from './context/wallet.js'
import { customElement, property, query } from 'lit/decorators.js'
import { LitElement, css, html } from 'lit'
import { Block, blockContext } from './context/block.js'
import { ContextProvider } from '@lit-labs/context'
import '@vandeurenglenn/lit-elements/icon-set.js'
import '@vandeurenglenn/lit-elements/dropdown.js'
import '@vandeurenglenn/flex-elements/column.js'
import '@vandeurenglenn/flex-elements/row.js'
import '@vandeurenglenn/flex-elements/it.js'
import './elements/sync-info.js'

globalThis.pubsub = globalThis.pubsub || new Pubsub(true);



const setTheme = (theme) => {
  for (const key of Object.keys(theme)) {
    document.querySelector('body').style.setProperty(`--${key}`, theme[key])
  }
}

setTheme(defaultTheme);

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

  #blockContextProvider = new ContextProvider(this, {context: blockContext});
  #walletContextProvider = new ContextProvider(this, {context: walletContext});

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
    
    
    
    console.log(selected, object);
    selected && await this.#select(selected)

    const explorerView = this.shadowRoot.querySelector('explorer-view')

    if (selected === 'explorer' && object.block !== undefined) {
      await this.shadowRoot.querySelector('explorer-view').select('block')
      await this.#nodeReady
      console.log('ready');
      
      this.block = await client.getBlock(object.index)
      console.log(this.block);
      
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

  async connectedCallback() {
    super.connectedCallback()
    
    this.peersConnected = 0
    pubsub.subscribe('lastBlock', (block) => this.syncInfo.lastBlockIndex = block.index)
    pubsub.subscribe('block-resolved', (block) => this.syncInfo.totalResolved += 1)
    pubsub.subscribe('block-loaded', (block) => this.syncInfo.totalLoaded += 1)
    // let importee
    // importee = await import('@leofcoin/endpoint-clients/ws')
    // globalThis.client = await new importee.default('wss://ws-remote.leofcoin.org', 'peach')
    // // @ts-ignore
    // globalThis.client.init && await globalThis.client.init()

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
    
    if (!globalThis.walletStorage) {
      const importee = await import('@leofcoin/storage')
      globalThis.walletStorage = await new Storage('wallet')
      await walletStorage.init()
    }
    const hasWallet = await walletStorage.has('identity')
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
        font-family: system-ui, "Noto Sans", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";

        background: linear-gradient(45deg, #6495ed78, transparent);
        background: var(--main-background);
        font-size: .875rem;
        font-weight: 400;
        line-height: 1.5;
      }

      .main {
        height: -webkit-fill-available;
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
        display:flex;
        flex-direction:column;
        width:100%;
        height: 100%;
      }

      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 6px rgba(255,255,255,0.3);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb {
        border-radius: 10px;
        -webkit-box-shadow: inset 0 0 6px rgba(225,255,255,0.5);
      }

      .resolver-snack, .loader-snack {
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
      </template>
    </custom-icon-set>
    <flex-row class="main">
      <span class="custom-selector-overlay">
        <custom-selector attr-for-selected="data-route">
          <a href="#!/wallet" data-route="wallet">
            <custom-svg-icon icon="wallet"></custom-svg-icon>
          </a>
          <a href="#!/identity" data-route="identity">
            <custom-svg-icon icon="account-circle"></custom-svg-icon>
          </a>
          <a href="#!/explorer" data-route="explorer">
            <custom-svg-icon icon="explorer"></custom-svg-icon>
          </a>
          <a href="#!/validator" data-route="validator">
            <custom-svg-icon icon="gavel"></custom-svg-icon>
          </a>
          <a href="#!/editor" data-route="editor">
            <custom-svg-icon icon="mode-edit"></custom-svg-icon>
          </a>
          <a href="#!/stats" data-route="stats">
            <custom-svg-icon icon="stats"></custom-svg-icon>
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
          
        </custom-pages>

      </flex-column>
      


    </flex-row>

      <login-screen></login-screen>
      <export-screen></export-screen>
      
    <sync-info></sync-info>
      
    `
  }
}
export default AppShell