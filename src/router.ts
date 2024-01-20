import type AppShell from './shell.js'

export default class Router {
  #host: AppShell

  get host() {
    return this.#host
  }

  constructor(host: AppShell, defaultView: string) {
    this.#host = host
    globalThis.onhashchange = this.#onhashchange

    if (Router.isbang(location.hash)) this.#onhashchange()
    else location.hash = Router.bang(defaultView)
  }

  static debang(hash) {
    if (!hash.includes('#!/')) return hash
    return hash.split('#!/')[1]
  }

  static bang(hash) {
    return `#!/${hash}`
  }

  static isbang(hash) {
    return hash.includes('#!/')
  }

  #parseUrl = async (hash) => {
    if (!globalThis.URLPattern) {
      await import('urlpattern-polyfill')
    }
    const urlPattern = new URLPattern(Router.debang(hash), location.host)

    const routes = urlPattern.pathname.split('/')
    console.log(routes)

    const route = routes.splice(0, 1)[0]
    const subroutes = routes
    const urlSearchParams = new URLSearchParams(urlPattern.search)
    const params: any = {}

    if (urlSearchParams.size > 0) {
      for await (const [key, value] of urlSearchParams.entries()) {
        params[key] = value
      }
    }
    return { params, route, subroutes }
  }

  #onhashchange = async () => {
    const { params, route, subroutes } = await this.#parseUrl(location.hash)

    if (route) {
      await this.#host.select(route)
      let previousRoute = this.#host.pages.querySelector('.custom-selected')
      if (subroutes.length === 0 && !previousRoute.pages.selected) {
        // handleDefaults
        if (route === 'wallet') subroutes.push('send')
        if (route === 'explorer' || route === 'identity') subroutes.push('dashboard')
      }
      for (const route of subroutes) {
        await previousRoute.select(route)

        previousRoute = previousRoute.pages.querySelector('.custom-selected')
      }

      for (const param in params) {
        previousRoute[param] = params[param]
      }
    }
    return

    route && (await this.host.select(route, subroutes, params))

    const explorerView = this.host.shadowRoot.querySelector('explorer-view')

    if (selected === 'explorer' && object.block !== undefined) {
      await this.host.shadowRoot.querySelector('explorer-view').select('block')
      await this.#host.nodeReady

      this.host.block = await client.getBlock(object.index)
    }

    if (selected === 'explorer' && object.blockTransactions !== undefined) {
      await this.host.shadowRoot.querySelector('explorer-view').select('block-transactions')
      explorerView.shadowRoot.querySelector('explorer-block-transactions').updateInfo(object.block, object.index)
    }
    if (selected === 'explorer' && object.transaction !== undefined) {
      await this.host.shadowRoot.querySelector('explorer-view').select('transaction')
      explorerView.shadowRoot.querySelector('explorer-transaction').updateInfo(object.blockIndex, object.index)
    }
    if (selected === 'explorer' && object.selected) {
      await this.host.shadowRoot.querySelector('explorer-view').select(object.selected)
    }
    if (selected === 'explorer' && Object.keys(object).length === 0) {
      location.hash = '#!/explorer?selected=dashboard'
    }

    const identityView = this.host.shadowRoot.querySelector('identity-view')

    if (selected === 'identity' && object.account !== undefined) {
      await this.host.shadowRoot.querySelector('identity-view').select('account')
      identityView.shadowRoot.querySelector('identity-account').updateInfo(object.account)
    }
    if (selected === 'identity' && object.selected) {
      await this.host.shadowRoot.querySelector('identity-view').select(object.selected)
    }
    if (selected === 'identity' && Object.keys(object).length === 0) {
      location.hash = '#!/identity?selected=dashboard'
    }
  }
}
