const mixins = {};

function _(superclass) {
  return {
    with(...mixins) {
      return mixins.reduce((c, mixin) => mixin(c), superclass || class {});
    }

  };
}

mixins.abstract = function (superclass) {
  return class extends superclass {
    static define(template, prefix) {
      window.Jellycat.components[this.name] = {
        template: template,
        cache: {}
      };

      if (customElements.get(`${prefix}-${this.name.toLowerCase()}`) === undefined) {
        customElements.define(`${prefix}-${this.name.toLowerCase()}`, this, this._tag ? {
          extends: this._tag
        } : {});
      }
    }

    get methods() {
      const reflect = Reflect.getPrototypeOf(this);
      return Reflect.ownKeys(reflect).filter(m => m !== 'constructor');
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
      return [Jellycat.options];
    }

    async _render() {
      if (this.constructor.name in Jellycat.components) {
        if (this.children.length > 0) this.innerHTML = "";
        this.appendChild(await this.draw());
      }

      return [Jellycat.components[this.constructor.name].cache];
    }

    async _behavior() {
      return [Jellycat.globalScope];
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

    async draw(id = 'root') {
      if (this.currentLifeCycleIndex < this.keyLifeCycle.indexOf('render')) {
        throw new Error(`You cannot use draw method before render step (current state: ${this.currentLifeCycle}) of lifeCycle of ${this.constructor.name}`);
      }

      if (Object.keys(Jellycat.components[this.constructor.name].cache).length === 0) {
        let response = await fetch(Jellycat.components[this.constructor.name].template);

        if (response.status != 200) {
          throw new Error(`Template ${response.statusText} (${response.url})`);
        }

        const text = await response.text();
        const html = new DOMParser().parseFromString(text, 'text/html');
        const templates = Array.from(html.querySelectorAll('template')).reduce((template, element) => {
          return { ...template,
            [element.id]: element
          };
        }, {});
        Jellycat.components[this.constructor.name].cache = templates;
      }

      return Jellycat.components[this.constructor.name].cache[this.template != null ? this.template : id].content;
    }

    drawElement(tagname, attrs = {}, children = []) {
      const element = document.createElement(tagname);

      for (const [key, value] of Object.entries(attrs)) {
        element.setAttribute(key, value);
      }

      children.forEach(child => typeof child === 'string' ? element.textContent = child : element.appendChild(child));
      return element;
    }

    drawFaIcon(name) {
      const fontAwesomeLoadedFromModule = document.querySelector('body').className.includes('fontawesome');
      const fontAwesomeLoadedFromLink = Array.from(document.styleSheets).filter(s => s.href.includes('font-awesome')).length > 0;

      if (!fontAwesomeLoadedFromModule && !fontAwesomeLoadedFromLink) {
        throw new Error('FontAwesome is not available on this page, you cannot use drawFaIcon()');
      }

      const icon = document.createElement('i');
      icon.classList.add('fa-solid', name);
      return icon;
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
      try {
        // TO DO / COMPLETE
        if (this.currentLifeCycleIndex < this.keyLifeCycle.indexOf('init')) {
          throw new Error(`You cannot use fetchData method before init step (current state: ${this.currentLifeCycle}) of lifeCycle of ${this.name}`);
        }

        const response = await fetch(url, {
          method: method,
          headers: new Headers({
            "X-Requested-With": "XMLHttpRequest",
            "accept": "application/json"
          })
        });
        if (response.status >= 300) throw new Error(`Fetch error : ${args[0]}`);
        return await response.json();
      } catch (error) {
        console.log(error);
      }
    }

  };
};

window.Jellycat ??= new class Jellycat {
  constructor() {
    this.components = {};
    this.globalScope = {};
    this.options = {
      debug: false
    };
    this.factory = {
      JcComponent: class JcComponent extends _(HTMLElement).with(...Object.values(mixins)) {
        constructor() {
          super();
          this._tag = false;
        }

        async connectedCallback() {
          this._runLifeCycle();
        }

      },
      JcDivComponent: class JcDivComponent extends _(HTMLDivElement).with(...Object.values(mixins)) {
        constructor() {
          super();
          this._tag = 'div';
        }

        async connectedCallback() {
          this._runLifeCycle();
        }

      },
      JcSpanComponent: class JcSpanComponent extends _(HTMLSpanElement).with(...Object.values(mixins)) {
        constructor() {
          super();
          this._tag = 'span';
        }

        async connectedCallback() {
          this._runLifeCycle();
        }

      },
      JcUlComponent: class JcUlComponent extends _(HTMLUListElement).with(...Object.values(mixins)) {
        constructor() {
          super();
          this._tag = 'ul';
        }

        async connectedCallback() {
          this._runLifeCycle();
        }

      },
      JcLiComponent: class JcLiComponent extends _(HTMLLIElement).with(...Object.values(mixins)) {
        constructor() {
          super();
          this._tag = 'li';
        }

        async connectedCallback() {
          this._runLifeCycle();
        }

      },
      JcPComponent: class JcPComponent extends _(HTMLParagraphElement).with(...Object.values(mixins)) {
        constructor() {
          super();
          this._tag = 'p';
        }

        async connectedCallback() {
          this._runLifeCycle();
        }

      },
      JcLabelComponent: class JcLabelComponent extends _(HTMLLabelElement).with(...Object.values(mixins)) {
        constructor() {
          super();
          this._tag = 'label';
        }

        async connectedCallback() {
          this._runLifeCycle();
        }

      }
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
  JcLabelComponent
} = window.Jellycat.factory;

export { JcComponent, JcDivComponent, JcLabelComponent, JcLiComponent, JcPComponent, JcSpanComponent, JcUlComponent };
