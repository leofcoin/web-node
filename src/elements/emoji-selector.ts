customElements.define(
  'emo-ji',
  class EmoJi extends HTMLElement {
    constructor() {
      super()
      this.attachShadow({ mode: 'open' })
      this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: flex;
        /* width: 28px; */

        font-size: 24px;
        cursor: pointer;
        align-items:center;
        justify-content: center;
        box-sizin: border-box;
        padding: 4px;
      }
      ::slotted(*), slot {
        pointer-events: none;
      }
    </style>
    <slot></slot>`
    }
  }
)

customElements.define(
  'emoji-selector',
  class EmojiSelector extends HTMLElement {
    get _pages() {
      return this.shadowRoot.querySelector('custom-pages')
    }
    constructor() {
      super()
      this.attachShadow({ mode: 'open' })
      this.render()
    }
    connectedCallback() {
      async function init(self) {
        globalThis.emojis = (await import('./../../node_modules/unicode-emoji-json/data-by-group.json')).default
        // const emojis = await self._parseEmojis()
        await self._buildPages(globalThis.emojis)
      }
      this._select = this._select.bind(this)
      this.shadowRoot.querySelector('custom-tabs').addEventListener('selected', this._select)
      this.addEventListener('click', (event) => {
        if (!this.opened) {
          this.opened = true
          this.classList.add('opened')
          // } else {
          // this.opened = false;
          // this.classList.remove('opened')
        } else if (event.path[0].localName === 'emo-ji') {
          this.opened = false
          this.dispatchEvent(new CustomEvent('selected', { detail: event.path[0].char }))
          this.classList.remove('opened')
        }
      })

      init(this)
    }

    _parseEmojis() {
      return new Promise((resolve, reject) => {
        this.emojis = {}
        for (const [category, emojis] of Object.entries(globalThis.emojis)) {
          if (globalThis.emojis[i].category && emojis[i].category !== '_custom') {
            this.emojis[category] = this.emojis[emojis[i].category] || []

            this.emojis[emojis[i].category].push({
              name: i,
              keywords: emojis[i].keywords,
              char: emojis[i].emoji
            })
          }
        }

        resolve(this.emojis)
      })
    }

    _initPage(category) {
      const page = document.createElement('span')
      page.classList.add('page')
      page.dataset.route = category
      this._pages.appendChild(page)
      return page
    }

    _buildPages(emojis) {
      console.log(emojis)

      return new Promise((resolve, reject) => {
        for (const category of Object.keys(emojis)) {
          console.log(category)
          const page = this.querySelector(`span[data-route="${category}"]`) || this._initPage(category)
          for (const emoji of emojis[category]) {
            const el = document.createElement('emo-ji')
            page.appendChild(el)
            requestAnimationFrame(() => {
              el.title = `${emoji.name}\n\n${emoji.keywords}`
              el.name = emoji.name
              el.keywords = emoji.keywords
              el.emoji = emoji.emoji
              el.innerHTML = el.emoji
            })
          }
        }
      })
    }
    _select({ detail }) {
      const route = detail.getAttribute('data-route')
      requestAnimationFrame(() => {
        this._pages.select(route)
      })
    }
    render() {
      this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: flex;
        flex-direction: column;
        height: 40px;
        width: 100%;
        align-items: center;
      }
      custom-tab, custom-tabs {
        height: 40px;
        box-sizing: border-box;
        outline: none;
      }
      custom-tab {
        width: 40px;
        width: 40px;
        align-items: center;
        justify-content: center;
        display: flex;
        cursor: pointer;
      }
      custom-tabs {
        display: flex;
        justify-content: center
      }
      :host(.opened) {
        height: 360px;
        // transform: translateY(-250px);
      }
      custom-tab.custom-seleced {
        border: none;
      }
      :host(.opened) custom-tab.custom-seleced {
        border: auto;
      }
      :host(.opened) custom-pages {
        margin-bottom: 12px;
      }
      custom-pages {
        height: 100%;
        
        max-width: 960px;
        border-radius: 20px;
        box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14), 0 1px 8px 0 rgba(0, 0, 0, 0.12), 0 3px 3px -2px rgba(0, 0, 0, 0.4);
        
      }
      .page {
        display: flex;
        flex-flow: row wrap;
        justify-content: center;
        align-content: space-between;
        overflow-y: auto;
        padding-bottom: 24px;
        box-sizing: border-box;
        
        margin: 12px 0;
      }
      custom-icon {
        pointer-events: none;
      }

      emo-ji {
        width: 50px;
        height: 50px;
        font-size: 24px;

      }
    </style>
    <custom-pages attr-for-selected="data-route">
      <span class="page" data-route="history"></span>
    </custom-pages>
    <custom-tabs selected="history" id="tabs" tabindex="0" attr-for-seleced="data-route">
      <custom-tab data-route="history" title="history"><custom-icon icon="history"></custom-icon></custom-tab>
      
      <custom-tab data-route="Smileys & Emotion" title="Smileys & Emotion"><custom-icon icon="mood"></custom-icon></custom-tab>
      <custom-tab data-route="People & Body" title="People & Body"><custom-icon icon="people"></custom-icon></custom-tab>
      <custom-tab data-route="Animals & Nature" title="Animals & Nature"><custom-icon icon="local-florist"></custom-icon></custom-tab>
      <custom-tab data-route="Food & Drink" title="Food & Drink"><custom-icon icon="local-pizza"></custom-icon></custom-tab>
      <custom-tab data-route="Objects" title="Objects"><custom-icon icon="cake"></custom-icon></custom-tab>
      <custom-tab data-route="Activities" title="Activities"><custom-icon icon="directions-walk"></custom-icon></custom-tab>
      <custom-tab data-route="Travel & Places" title="Travel & Places"><custom-icon icon="account-balance"></custom-icon></custom-tab>
      <custom-tab data-route="Symbols" title="Symbols"><custom-icon icon="euro-symbol"></custom-icon></custom-tab>
      <custom-tab data-route="Flags" title="Flags"><custom-icon icon="flags"></custom-icon></custom-tab>
    </custom-tabs>
    `
    }
  }
)
