var JellycatComponent=function(e){"use strict";const t={},n=e=>({with:(...t)=>t.reduce(((e,t)=>t(e)),e||class{})});t.abstract=function(e){return class extends e{options={};get methods(){const e=Reflect.getPrototypeOf(this);return Reflect.ownKeys(e).filter((e=>"constructor"!==e))}static async define(e=!1,t={}){Array.isArray(e)?await Promises.all(e.map((async e=>await Jellycat._cacheSet(this.name,e,t)))):await Jellycat._cacheSet(this.name,e,t);const n=void 0!==Jellycat._cache[this.name].options.prefix?Jellycat._cache[this.name].options.prefix:Jellycat._options.prefix,s=this.name[0].toLowerCase()+this.name.slice(1).replace(/[A-Z]/g,(e=>"-"+e.toLowerCase()));void 0===customElements.get(`${n}-${s}`)&&customElements.define(`${n}-${s}`,this,Jellycat._factory.resolve(super.name))}async connectedCallback(){this._runLifeCycle()}async disconnectedCallback(){const e=window.Jellycat._instances[this.constructor.name];window.Jellycat._instances[this.constructor.name]=e.filter((e=>e!==this))}}},t.lifeCycling=function(e){return class extends e{get keyLifeCycle(){return["down","init","render","behavior","up"]}get currentLifeCycleIndex(){return this.keyLifeCycle.indexOf(this.currentLifeCycle)}async _runLifeCycle(e="down"){try{const t=this.keyLifeCycle;this.currentLifeCycle??=e;const n=s(this);function*s(e){yield,yield e._runStep(t[1]),yield e._runStep(t[2]),yield e._runStep(t[3])}let o=n.next();for(;!o.done;)if(this.currentLifeCycle=t[this.currentLifeCycleIndex+1],o=n.next(),o.value&&!0!==await o.value)throw new Error(`LifeCycle ${this.currentLifeCycle} function of ${this.name} does not return true`)}catch(r){console.log(r)}}async _runStep(e){return new Promise((async(t,n)=>{const s=await this[`_${e}`]();t(!this.methods.includes(e)||await this[e](...s))}))}async _init(){this.constructor.name in Jellycat._instances&&Jellycat._instances[this.constructor.name].push(this);const e=this.getAttribute("options")?JSON.parse(this.getAttribute("options")):{};return this.options=Object.assign(Jellycat._options,Jellycat._cache[this.constructor.name].options,e),[]}async _render(){if(this.constructor.name in Jellycat._cache&&"root"===this.options.autoRender){let e=this.drawTemplate();e&&this.children.length>0&&(this.innerHTML=""),e&&this.appendChild(e)}return[]}async _behavior(){return[Jellycat._scope]}_checkLifeCycle(e,t){if(this.currentLifeCycleIndex<this.keyLifeCycle.indexOf(e))throw new Error(`You cannot use ${t} method before render ${e} (current state: ${this.currentLifeCycle}) of lifeCycle of ${this.constructor.name}`)}async rollBackToLifeCycle(e){await this._runLifeCycle(e)}}},t.rendering=function(e){return class extends e{get template(){return this.getAttribute("template")}set template(e){return this.setAttribute("template",e),!0}get templatesCached(){return Object.keys(Jellycat._cache[this.constructor.name].templates)}draw(e=null,t=!1){this._checkLifeCycle("render","draw");const n=this.drawTemplate(e);return(t=t||this).children.length>0&&[...t.children].forEach((e=>e.remove())),t.appendChild(n),!0}drawTemplate(e){this._checkLifeCycle("render","drawTemplate");const t=e||(null==this.template?"root":this.template);return t in Jellycat._cache[this.constructor.name].templates&&Jellycat._cache[this.constructor.name].templates[t].content.cloneNode(!0)}drawElement(e,t={},n=[]){this._checkLifeCycle("render","drawElement");const s=document.createElement(e);for(const[e,n]of Object.entries(t))s.setAttribute(e,n);return n.forEach((e=>"string"==typeof e?s.textContent=e:s.appendChild(e))),s}drawFaIcon(e,t="fa-solid"){window.FontAwesome||console.error("FontAwesome is not available on this page, you cannot use drawFaIcon()");const n=document.createElement("i");return n.classList.add(t,e),n}}},t.scoping=function(e){return class extends e{getDomParentComponent(e=null){let t=e??this;for(;"BODY"!==t.tagName||t===this;)if(t=t.parentElement,t.tagName.startsWith(`${Jellycat._options.prefix.toUpperCase()}-`))return t;return null}}},t.providing=function(e){return class extends e{get loading(){return this.hasAttribute("loading")}set loading(e){return e?this.setAttribute("loading",""):this.removeAttribute("loading"),!0}async fetchData(e,t="GET",n=!1){this.loading=!0;const s=await Jellycat._fetchData(e,t,n);return this.loading=!1,s}}},window.Jellycat??=new class{constructor(){this._options={prefix:"jc",debug:!1,autoRender:"root",auth:{},fetch:{}},this._scope={},this._instances={},this._cache={},this._factory={JcComponent:class extends(n(HTMLElement).with(...Object.values(t))){constructor(){super()}},JcDivComponent:class extends(n(HTMLDivElement).with(...Object.values(t))){constructor(){super()}},JcSpanComponent:class extends(n(HTMLSpanElement).with(...Object.values(t))){constructor(){super()}},JcUlComponent:class extends(n(HTMLUListElement).with(...Object.values(t))){constructor(){super()}},JcLiComponent:class extends(n(HTMLLIElement).with(...Object.values(t))){constructor(){super()}},JcPComponent:class extends(n(HTMLParagraphElement).with(...Object.values(t))){constructor(){super()}},JcLabelComponent:class extends(n(HTMLLabelElement).with(...Object.values(t))){constructor(){super()}},JcInputComponent:class extends(n(HTMLInputElement).with(...Object.values(t))){constructor(){super()}},JcTextareaComponent:class extends(n(HTMLTextAreaElement).with(...Object.values(t))){constructor(){super()}},resolve:e=>{switch(e){case"HTMLElement":return{};case"HTMLDivElement":return{extends:"div"};case"HTMLSpanElement":return{extends:"span"};case"HTMLUListElement":return{extends:"ul"};case"HTMLLIElement":return{extends:"li"};case"HTMLParagraphElement":return{extends:"p"};case"HTMLLabelElement":return{extends:"label"};case"HTMLInputElement":return{extends:"input"};case"HTMLTextAreaElement":return{extends:"textarea"}}},JcMixin:n}}options(e={}){if("object"!=typeof e)throw new Error("Options must take object as parameter type");return this._options=Object.assign(this._options,e),this}async authenticate(e={}){if(void 0===this._options.auth.login)throw new Error("You must define options auth.login first to use authenticate method");const t=await this._fetchData(this._options.auth.login,"POST",JSON.stringify(e));return this._token={value:t.token,key:null!=this._options.auth.header?this._options.auth.header:"Authorization"},"token"in t?{success:!0}:{success:!1,message:t.message}}async refresh(){if(void 0===this._options.auth.refresh)throw new Error("You must define options auth.refresh first to use refresh method");const e=await this._fetchData(this._options.auth.refresh,"POST",!1);return"token"in e&&(this._token={value:e.token,key:null!=this._options.auth.header?this._options.auth.header:"Authorization"},!0)}async _fetchData(e,t="GET",n=!1){try{let s=[this._options.auth.refresh,this._options.auth.login].includes(e),o=await fetch(e,this._buildRequest(t,n));if(401===o.status&&void 0!==this._options.auth.refresh&&!s&&await this.refresh())return await this._fetchData(e,t,n);if(o.status>=400)throw new Error(`Fetch error - ${o.statusText}`);return await o.json()}catch(e){return{error:e.message}}}_buildHeaders(){let e=new Headers;return e.append("X-Requested-With","XmlHttpRequest"),e.append("Content-Type","application/json"),e.append("Accept","application/json"),this._token?.value&&e.append(this._token.key,`${this._options.auth.type} ${this._token.value}`),this._options.fetch?.headers?.length>0&&this._options.fetch.headers.forEach((t=>{e.has(t.key)?e.set(t.key,t.value):e.append(t.key,t.value)})),e}_buildRequest(e="GET",t=!1){let n={method:e,headers:this._buildHeaders()};return null!=this._options.fetch.mode&&(n.mode=this._options.fetch.mode),null!=this._options.fetch.cache&&(n.cache=this._options.fetch.cache),!1!==t&&(n.body=t),n}async _cacheSet(e,t=!1,n={}){let s=[];if(t){let e=await fetch(t);if(200!=e.status)throw new Error(`Template ${e.statusText} (${e.url})`);const n=await e.text(),o=(new DOMParser).parseFromString(n,"text/html");s=Array.from(o.querySelectorAll("template")).reduce(((e,t)=>({...e,[t.id]:t})),{})}e in this._instances||(this._instances[e]=[]),this._cache[e]={source:t,templates:s,options:n}}};const{JcComponent:s,JcDivComponent:o,JcSpanComponent:r,JcUlComponent:i,JcLiComponent:a,JcPComponent:c,JcLabelComponent:l,JcInputComponent:h,JcTextareaComponent:u,JcMixin:p}=Jellycat._factory;return e.JcComponent=s,e.JcDivComponent=o,e.JcInputComponent=h,e.JcLabelComponent=l,e.JcLiComponent=a,e.JcMixin=p,e.JcPComponent=c,e.JcSpanComponent=r,e.JcTextareaComponent=u,e.JcUlComponent=i,Object.defineProperty(e,"__esModule",{value:!0}),e}({});
