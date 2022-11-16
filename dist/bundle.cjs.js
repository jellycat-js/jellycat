'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/* TODO
- mettre a jour la doc
- multiple templates loading pour un component
- récupérer App ou autre component, s'il existe depuis jellycat
- reflechir au scope ? une piste pourrait etre l'heritage
- permettre les mixins custom
- verifier si aucun composant ne porte deja ce nom
- rajouter un draw "replace" template (with clean before)
- permettre de reculer le lifecycle sans break son execution
- coder la partie Auth plus proprement
- voir pourquoi le "is=" extend from HTMLElement ne fonctionne plus
- Permettre l'injection dans les templates avec {{ }}
- Pourquoi pas proposer twig ejs et pug
*/

const mixins = {};

const _ = superclass => {
  return {
    with(...mixins) {
      return mixins.reduce((c, mixin) => mixin(c), superclass || class {});
    }

  };
};

mixins.abstract = function (superclass) {
  return class extends superclass {
    options = {};

    get methods() {
      const reflect = Reflect.getPrototypeOf(this);
      return Reflect.ownKeys(reflect).filter(m => m !== 'constructor');
    } // TODO : Feature components depends from an other.


    static async define(templateUrl = false, options = {}) {
      await Jellycat._cacheSet(this.name, templateUrl, options);
      const prefix = Jellycat._cache[this.name].options.prefix !== undefined ? Jellycat._cache[this.name].options.prefix : Jellycat._options.prefix;

      if (customElements.get(`${prefix}-${this.name.toLowerCase()}`) === undefined) {
        customElements.define(`${prefix}-${this.name.toLowerCase()}`, this, this._tag ? {
          extends: this._tag
        } : {});
      }
    }

    async connectedCallback() {
      this._runLifeCycle();
    }

    async disconnectedCallback() {
      const instances = window.Jellycat._instances[this.constructor.name];
      window.Jellycat._instances[this.constructor.name] = instances.filter(component => component !== this);
    }

  };
};

mixins.lifeCycling = function (superclass) {
  return class extends superclass {
    get keyLifeCycle() {
      return ['down', 'init', 'render', 'behavior', 'up'];
    }

    get currentLifeCycleIndex() {
      return this.keyLifeCycle.indexOf(this.currentLifeCycle);
    }

    async _runLifeCycle(since = 'down') {
      try {
        const keyLifeCycle = this.keyLifeCycle;
        this.currentLifeCycle ??= keyLifeCycle[0];

        const componentlifeCycle = _lifeCycle(this);

        function* _lifeCycle(component) {
          yield; //----------------(keyLifeCycle[0])------ down

          yield component._runStep(keyLifeCycle[1]); //--- init

          yield component._runStep(keyLifeCycle[2]); //--- render

          yield component._runStep(keyLifeCycle[3]); //--- behavior
          // ---------------------(keyLifeCycle[4])------ up
        }

        let lifeCycle = componentlifeCycle.next();

        while (!lifeCycle.done) {
          this.currentLifeCycle = keyLifeCycle[this.currentLifeCycleIndex + 1];
          lifeCycle = componentlifeCycle.next();

          if (lifeCycle.value && (await lifeCycle.value) !== true) {
            throw new Error(`LifeCycle ${this.currentLifeCycle} function of ${this.name} does not return true`);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    async _runStep(lifeCycle) {
      return new Promise(async (resolve, reject) => {
        const args = await this[`_${lifeCycle}`]();
        resolve(this.methods.includes(lifeCycle) ? await this[lifeCycle](...args) : true);
      });
    }

    async _init() {
      if (this.constructor.name in Jellycat._instances) {
        Jellycat._instances[this.constructor.name].push(this);
      }

      const options = this.getAttribute('options') ? JSON.parse(this.getAttribute('options')) : {};
      this.options = Object.assign(Jellycat._options, Jellycat._cache[this.constructor.name].options, options);
      return [];
    }

    async _render() {
      if (this.constructor.name in Jellycat._cache && this.options.autoRender === 'root') {
        if (this.children.length > 0) this.innerHTML = "";
        let template = this.drawTemplate();
        if (template) this.appendChild(template);
      }

      return [];
    }

    async _behavior() {
      return [Jellycat._scope];
    }

    _checkLifeCycle(minLifeCycle, methodName) {
      if (this.currentLifeCycleIndex < this.keyLifeCycle.indexOf(minLifeCycle)) {
        throw new Error(`You cannot use ${methodName} method before render ${minLifeCycle} (current state: ${this.currentLifeCycle}) of lifeCycle of ${this.constructor.name}`);
      }
    }

  };
};

mixins.rendering = function (superclass) {
  return class extends superclass {
    get template() {
      return this.getAttribute('template');
    }

    set template(template) {
      this.setAttribute('template', template);
      return true;
    }

    get templatesCached() {
      return Object.keys(Jellycat._cache[this.constructor.name].templates);
    }

    draw(template = null, target = false) {
      this._checkLifeCycle('render', 'draw');

      const element = this.drawTemplate(template);
      target = !target ? this : target;

      if (target.children.length > 0) {
        [...target.children].forEach(child => child.remove());
      }

      target.appendChild(element);
      return true;
    }

    drawTemplate(template) {
      this._checkLifeCycle('render', 'drawTemplate');

      const name = !template ? this.template == null ? 'root' : this.template : template;
      return name in Jellycat._cache[this.constructor.name].templates ? Jellycat._cache[this.constructor.name].templates[name].content.cloneNode(true) : false;
    }

    drawElement(tagname, attrs = {}, children = []) {
      this._checkLifeCycle('render', 'drawElement');

      const element = document.createElement(tagname);

      for (const [key, value] of Object.entries(attrs)) {
        element.setAttribute(key, value);
      }

      children.forEach(child => typeof child === 'string' ? element.textContent = child : element.appendChild(child));
      return element;
    }

    drawFaIcon(name, rootClass = 'fa-solid') {
      if (!window.FontAwesome) {
        console.error('FontAwesome is not available on this page, you cannot use drawFaIcon()');
      }

      const icon = document.createElement('i');
      icon.classList.add(rootClass, name);
      return icon;
    }

  };
};

mixins.scoping = function (superclass) {
  return class extends superclass {
    // scope(ref = false)
    // {
    // 	return !ref ? Jellycat._scope : (Jellycat._scope[ref] || undefined)
    // }
    // expose(ref, prop)
    // {
    // 	if (prop.constructor === String && prop in this) {
    // 		Jellycat._scope[ref] = new Proxy(this[prop], {
    // 			set: (obj, key, value) => {
    // 				if (key in obj) return false
    // 				obj[key] = _ => this[key]
    // 			    return true;
    // 			}
    // 		})
    // 	} else { Jellycat._scope[ref] = prop }
    // }
    getDomParentComponent(element = null) {
      let currentElement = element ?? this;

      while (currentElement.tagName !== 'BODY' || currentElement === this) {
        currentElement = currentElement.parentElement;

        if (currentElement.tagName.startsWith(`${Jellycat._options.prefix.toUpperCase()}-`)) {
          return currentElement;
        }
      }

      return null;
    }

  };
};

mixins.providing = function (superclass) {
  return class extends superclass {
    get loading() {
      return this.hasAttribute('loading');
    }

    set loading(loading) {
      loading ? this.setAttribute('loading', '') : this.removeAttribute('loading');
      return true;
    }

    async fetchData(url, method = 'GET', data = false) {
      this.loading = true;
      const result = await Jellycat._fetchData(url, method, data);
      this.loading = false;
      return result;
    }

  };
};

window.Jellycat ??= new class Jellycat {
  constructor() {
    this._options = {
      prefix: 'jc',
      debug: false,
      autoRender: 'root',
      auth: {},
      fetch: {}
    };
    this._scope = {};
    this._instances = {};
    this._cache = {};
    this._factory = {
      JcComponent: class JcComponent extends _(HTMLElement).with(...Object.values(mixins)) {
        constructor() {
          super();
        }

        _tag = false;
      },
      JcDivComponent: class JcDivComponent extends _(HTMLDivElement).with(...Object.values(mixins)) {
        constructor() {
          super();
        }

        _tag = 'div';
      },
      JcSpanComponent: class JcSpanComponent extends _(HTMLSpanElement).with(...Object.values(mixins)) {
        constructor() {
          super();
        }

        _tag = 'span';
      },
      JcUlComponent: class JcUlComponent extends _(HTMLUListElement).with(...Object.values(mixins)) {
        constructor() {
          super();
        }

        _tag = 'ul';
      },
      JcLiComponent: class JcLiComponent extends _(HTMLLIElement).with(...Object.values(mixins)) {
        constructor() {
          super();
        }

        _tag = 'li';
      },
      JcPComponent: class JcPComponent extends _(HTMLParagraphElement).with(...Object.values(mixins)) {
        constructor() {
          super();
        }

        _tag = 'p';
      },
      JcLabelComponent: class JcLabelComponent extends _(HTMLLabelElement).with(...Object.values(mixins)) {
        constructor() {
          super();
        }

        _tag = 'label';
      },
      JcInputComponent: class JcInputComponent extends _(HTMLInputElement).with(...Object.values(mixins)) {
        constructor() {
          super();
        }

        _tag = 'input';
      },
      JcTextareaComponent: class JcTextareaComponent extends _(HTMLTextAreaElement).with(...Object.values(mixins)) {
        constructor() {
          super();
        }

        _tag = 'textarea';
      },
      JcMixin: _
    };
  }

  options(options = {}) {
    if (typeof options !== 'object') throw new Error('Options must take object as parameter type');
    this._options = Object.assign(this._options, options);
    return this;
  }

  async authenticate(credentials = {}) {
    if (this._options.auth.login === undefined) {
      throw new Error('You must define options auth.login first to use authenticate method');
    }

    const response = await this._fetchData(this._options.auth.login, 'POST', JSON.stringify(credentials));
    this._token = {
      value: response.token,
      key: this._options.auth.header != undefined ? this._options.auth.header : 'Authorization'
    };
  }

  async refresh() {
    if (this._options.auth.refresh === undefined) {
      throw new Error('You must define options auth.refresh first to use refresh method');
    }

    const response = await this._fetchData(this._options.auth.refresh, 'POST');

    if ('token' in response) {
      this._token = {
        value: response.token,
        key: this._options.auth.header != undefined ? this._options.auth.header : 'Authorization'
      };
      return true;
    }

    return false;
  }

  async _fetchData(url, method = 'GET', data = false) {
    try {
      const response = await fetch(url, this._buildRequest(method, data));

      if (response.status >= 300) {
        console.log(response);
        throw new Error(`Fetch error : ${JSON.stringify(response)}`);
      }

      return await response.json();
    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  _buildHeaders() {
    let headers = new Headers();
    headers.append("X-Requested-With", "XmlHttpRequest");
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");

    if (this._token) {
      headers.append(this._token.key, `${this._options.auth.type} ${this._token.value}`);
    }

    if (this._options.fetch?.headers?.length > 0) {
      this._options.fetch.headers.forEach(header => {
        headers.has(header.key) ? headers.set(header.key, header.value) : headers.append(header.key, header.value);
      });
    }

    return headers;
  }

  _buildRequest(method, data = false) {
    let requestObj = {
      method: method,
      headers: this._buildHeaders()
    };

    if (this._options.fetch.mode != undefined) {
      requestObj.mode = this._options.fetch.mode;
    }

    if (this._options.fetch.cache != undefined) {
      requestObj.cache = this._options.fetch.cache;
    }

    if (data !== false) requestObj.body = data;
    return requestObj;
  }

  async _cacheSet(name, templateUrl = false, options = {}) {
    let templates = [];

    if (templateUrl) {
      let response = await fetch(templateUrl);

      if (response.status != 200) {
        throw new Error(`Template ${response.statusText} (${response.url})`);
      }

      const text = await response.text();
      const html = new DOMParser().parseFromString(text, 'text/html');
      templates = Array.from(html.querySelectorAll('template')).reduce((template, element) => {
        return { ...template,
          [element.id]: element
        };
      }, {});
    }

    if (!(name in this._instances)) this._instances[name] = [];
    this._cache[name] = {
      source: templateUrl,
      templates: templates,
      options: options
    };
  }

}();
const {
  JcComponent,
  JcDivComponent,
  JcSpanComponent,
  JcUlComponent,
  JcLiComponent,
  JcPComponent,
  JcLabelComponent,
  JcInputComponent,
  JcTextareaComponent,
  JcMixin
} = Jellycat._factory;

exports.JcComponent = JcComponent;
exports.JcDivComponent = JcDivComponent;
exports.JcInputComponent = JcInputComponent;
exports.JcLabelComponent = JcLabelComponent;
exports.JcLiComponent = JcLiComponent;
exports.JcMixin = JcMixin;
exports.JcPComponent = JcPComponent;
exports.JcSpanComponent = JcSpanComponent;
exports.JcTextareaComponent = JcTextareaComponent;
exports.JcUlComponent = JcUlComponent;
