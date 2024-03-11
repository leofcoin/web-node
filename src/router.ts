import type AppShell from './shell.js'

// minimal needed interface to support routing & subrouting
export interface Selectable extends HTMLElement {
  pages: Selectable
  select: Function
  selected: string | HTMLElement | number
}

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
    // @ts-expect-error
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
      let previousRoute = this.#host.pages.querySelector('.custom-selected') as Selectable
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
  }
}
