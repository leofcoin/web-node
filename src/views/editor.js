import { version } from '../../package.json'


// import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
// import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'

export default customElements.define('editor-view', class editorView extends HTMLElement {
  #validators = []
  #editor
  constructor() {
    super()

    this.attachShadow({mode: 'open'})
    this.shadowRoot.innerHTML = this.template
  }


  async connectedCallback() {
    const importee = await import('@monaco-import');
    
globalThis.monaco = importee.default
let span = document.createElement('span')
span.classList.add('container')
document.body.querySelector('app-shell').appendChild(span)

const token = await api.readFile('./templates/wizard/my-token.js')
const standard = await api.readFile('./templates/standards/token.js')
const roles = await api.readFile('./templates/standards/roles.js')

monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ES2015,
    noEmit: true,
    esModuleInterop: true,
    strict: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    isolatedModules: true
});

monaco.languages.typescript.javascriptDefaults.addExtraLib(`
  declare module Roles
  ${new TextDecoder().decode(roles)}
}`, 'roles.d.ts')

// monaco.languages.typescript.javascriptDefaults.addExtraLib(`
// declare class Token {
//   private #name: string;
//   constructor(name: string, symbol: string, decimals = 18, state: object)
// }
// `, 'token.d.ts')

const tokenModel = monaco.editor.createModel(new TextDecoder().decode(token), 'javascript', monaco.Uri.parse('file://app/templates/wizard/my-token.js'));

const standardModel = monaco.editor.createModel(new TextDecoder().decode(standard), 'javascript',  monaco.Uri.parse('file://app/templates/standards/token.js'));
const standarRolesdModel = monaco.editor.createModel(new TextDecoder().decode(roles), 'javascript',  monaco.Uri.parse('file://app/templates/standards/roles.js'));

  this.#editor = monaco.editor.create(document.querySelector('.container'));
  
  this.#editor.setModel(standardModel);
  this.#editor.setModel(standarRolesdModel);
  this.#editor.setModel(tokenModel);

  this.#editor.onKeyUp((e) => {
    const position = this.#editor.getPosition();
    const text = this.#editor.getModel().getLineContent(position.lineNumber).trim();
    if (e.keyCode === monaco.KeyCode.Enter && !text) {
      this.#editor.trigger('', 'editor.action.triggerSuggest', '');
    }
  });

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
    const code = monaco.editor.getModels()[0].getLinesContent().join('\n')
    const result = await api.deploy(code)
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

  get template() {
    return `
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
}
</style>

<flex-column class="updates"></flex-column>
<button class="fab">publish</button>
<flex-column class="container">
<slot></slot>
</flex-column>
    `
  }
})
