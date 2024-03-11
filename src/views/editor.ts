import palenightItalic from '../vs-themes/palenight-italic.json' assert { type: 'json' }
import Storage from '@leofcoin/storage'
import { convertTheme } from '@vandeurenglenn/monaco-utils'
import { LitElement, html } from 'lit'
// import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
// import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'

export default customElements.define(
  'editor-view',
  class editorView extends LitElement {
    #editor
    #enterAmount = 0
    editorStore = new Storage('editor')

    dependencies = ['@leofcoin:standards']

    async connectedCallback() {
      super.connectedCallback()
      await this.editorStore.init()
      const importee = await import('@monaco-import')
      console.log(importee)

      globalThis.monaco = importee.default

      let span = document.createElement('span')
      span.classList.add('container')
      document.body.querySelector('app-shell').appendChild(span)

      if (!(await this.editorStore.has('templates/wizard/my-token.js'))) {
        await this.editorStore.put(
          'templates/wizard/my-token.js',
          `
      import Token from '@leofcoin/standards/token.js'

      export default class MyToken extends Token {
        constructor(state) {
          super('MyToken', 'MTK', 18, state)
        }
      }
      `
        )

        let fetcher = await fetch('https://raw.githubusercontent.com/leofcoin/standards/main/exports/token.js')
        await this.editorStore.put('templates/standards/token.js', await fetcher.text())

        fetcher = await fetch('https://raw.githubusercontent.com/leofcoin/standards/main/exports/roles.js')
        await this.editorStore.put('templates/standards/roles.js', await fetcher.text())
      }

      const token = await this.editorStore.get('templates/wizard/my-token.js')
      const standard = await this.editorStore.get('templates/standards/token.js')
      const roles = await this.editorStore.get('templates/standards/roles.js')

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        esModuleInterop: true,
        allowJs: true,
        isolatedModules: true
      })

      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        `
    class Roles {
      #private;
      constructor(roles: {});
      /**
       *
       */
      get state(): {};
      get roles(): {};
      /**
       * @param {address} address
       * @param {string} role
       * @returns true | false
       */
      hasRole(address: address, role: string): boolean;
      grantRole(address: address, role: string): void;
      revokeRole(address: address, role: string): void;
  }

    declare module '@leofcoin/standards/roles.js' {
      export default Roles
    };

    declare module '@leofcoin/standards/token.js' {
      export default class Token extends Roles {
        #private;
        constructor(name: string, symbol: string, decimals: number, state: {
            roles?: {};
        });
        /**
         * @return {Object} {holders, balances, ...}
         */
        get state(): {};
        get totalSupply(): any;
        get name(): string;
        get symbol(): string;
        get holders(): number;
        get balances(): {};
        mint(to: any, amount: any): void;
        burn(from: address, amount: BigNumber): void;
        balanceOf(address: address): BigNumber;
        setApproval(operator: address, amount: BigNumber): void;
        approved(owner: address, operator: address, amount: BigNumber): boolean;
        transfer(from: address, to: address, amount: BigNumber): void;
    }
    };
  }`,
        'index.d.ts'
      )
      // monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      // declare class Token {
      //   private #name: string;
      //   constructor(name: string, symbol: string, decimals = 18, state: object)
      // }
      // `, 'token.d.ts')

      const tokenModel = monaco.editor.createModel(
        new TextDecoder().decode(token),
        'javascript',
        monaco.Uri.parse('file://templates/my-token.js')
      )

      const standardModel = monaco.editor.createModel(
        new TextDecoder().decode(standard),
        'javascript',
        monaco.Uri.parse('file://templates/node_modules/@leofcoin/standards/token.js')
      )
      const standarRolesdModel = monaco.editor.createModel(
        new TextDecoder().decode(roles),
        'javascript',
        monaco.Uri.parse('file://templates/node_modules/@leofcoin/standards/roles.js')
      )

      monaco.editor.defineTheme('palenight-italic', convertTheme(palenightItalic))

      this.#editor = monaco.editor.create(document.querySelector('.container'), {
        theme: 'palenight-italic'
      })

      this.#editor.setModel(standardModel)
      this.#editor.setModel(standarRolesdModel)
      this.#editor.setModel(tokenModel)

      this.#editor.onKeyUp((e) => {
        const position = this.#editor.getPosition()
        const text = this.#editor.getModel().getLineContent(position.lineNumber).trim()

        if (e.keyCode !== monaco.KeyCode.Enter) this.#enterAmount = 0
        if (e.keyCode === monaco.KeyCode.Enter && !text) {
          this.#enterAmount += 1
          if (this.#enterAmount === 2) {
            this.#editor.trigger('', 'editor.action.triggerSuggest', '')
            this.#enterAmount = 0
          }
        }
      })

      pubsub.subscribe('deployment-dependencies', this.ondependencies.bind(this))

      this.shadowRoot.querySelector('button').addEventListener('click', this.deploy.bind(this))
    }

    ondependencies(dependencies) {
      this.show(`found ${dependencies.length} dependencies
        ${JSON.stringify(dependencies)}
      `)

      setTimeout(() => {
        this.show('rolling up')
      }, 3000)
    }

    async deploy() {
      this.show('deploying')
      let code = monaco.editor.getModels()[0].getLinesContent().join('\n')
      let response = await fetch('https://deployer.leofcoin.org/bundle', {
        method: 'GET',
        body: JSON.stringify({ code, dependencies: this.dependencies })
      })

      code = await response.text()
      console.log(code)

      this.show(`
    <flex-row style="width: 100%; max-width: 640px; align-items: center;">
      <h4>${result.name}</h4>
      <flex-one></flex-one>
      <custom-svg-icon icon="close"></custom-svg-icon>
    </flex-row>
    <flex-row style="width: 100%; max-width: 640px; align-items: center; padding-bottom: 48px;">
      <h5>${result.address}</h5>
    </flex-row>
    
    <p style="width: 100%; max-width: 640px; overflow-y: auto;">${result.code}</p>
    `)

      this.shadowRoot.querySelector('custom-svg-icon[icon="close"]').addEventListener('click', this.hide.bind(this))
    }

    show(value) {
      this.shadowRoot.querySelector('.updates').setAttribute('shown', '')
      this.shadowRoot.querySelector('.updates').innerHTML = value
    }

    hide() {
      this.shadowRoot.querySelector('.updates').removeAttribute('shown')
      this.shadowRoot.querySelector('custom-svg-icon[icon="close"]').removeEventListener('click', this.hide.bind(this))
    }

    render() {
      return html`
        <style>
          :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
          }

          .container {
            width: 100%;
            height: 100%;
          }

          .fab {
            border-radius: 24px;
            height: 40px;
            position: absolute;
            bottom: 24px;
            right: 24px;
            z-index: 10000;
            padding: 12px 24px;
            box-sizing: border-box;
            align-items: center;
            justify-content: center;
            display: flex;
            border: 1px solid rgb(4 49 250 / 30%);
            background: #5b6f93;
            text-transform: capitalize;
            color: #eee;
          }

          .updates {
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #fff;
            z-index: 1;
            padding: 24px;
          }

          .updates[shown] {
            opacity: 1;
            pointer-events: auto;
            transition: 0.25;
          }
        </style>

        <flex-column class="updates"></flex-column>
        <button class="fab">publish</button>
        <flex-column class="container">
          <slot></slot>
        </flex-column>
      `
    }
  }
)
