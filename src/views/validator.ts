export default customElements.define('validator-view', class ValidatorView extends HTMLElement {
  #validators = [];

  constructor() {
    super()

    this.attachShadow({mode: 'open'})
    this.shadowRoot.innerHTML = this.template
  }


  async connectedCallback() {
    const result = await client.lookup('ArtOnlineValidators')
    
    this.#validators = await client.staticCall(result.address, 'validators')
    console.log(this.#validators);
    if (this.#validators[await client.selectedAccount()]) {
      await client.participate(await client.selectedAccount())
    }
    this.shadowRoot.querySelector('.total-validators').innerHTML = Object.keys(this.#validators).length
    this.shadowRoot.querySelector('.validators-online').innerHTML = Object.values(this.#validators).filter(validator => validator.lastSeen - new Date().getTime() > 30_000).length

    this.shadowRoot.querySelector('button').addEventListener('click', () => client.participate(client.selectedAccount()))
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
  }



</style>

<flex-row>

  
  <span>total validators</span>
    
  <flex-one></flex-one>
  <strong class="total-validators"></strong>
  
</flex-row>

<flex-row>
  <span>online validators</span>
  <flex-one></flex-one>
  <strong class="validators-online"></strong>
  
  
</flex-row>

<button>participate</button>
    `
  }
})
