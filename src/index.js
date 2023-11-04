'use strict'

const mixins = {}

const _ = superclass => {
	return { with(...mixins) {
		return mixins.reduce((c, mixin) => mixin(c), superclass || class {})
	}}
}

mixins.abstract = function(superclass)
{
	return class extends superclass
	{
		options = {}

		get methods() {
			const reflect = Reflect.getPrototypeOf(this)
			return Reflect.ownKeys(reflect).filter(m => m !== 'constructor')
		}

		static async define(templateUrls = false, options = {})
		{
			!Array.isArray(templateUrls)
				? await Jellycat._cacheSet(this.name, [templateUrls], options)
				: await Jellycat._cacheSet(this.name, templateUrls, options)

			const prefix = Jellycat._cache[this.name].options.prefix !== undefined 
				? Jellycat._cache[this.name].options.prefix 
				: Jellycat._options.prefix

			const dashedName = this.name[0].toLowerCase() + this.name.slice(1).replace(/[A-Z]/g, m => "-" + m.toLowerCase())

			if (customElements.get(`${prefix}-${dashedName}`) === undefined) {
				customElements.define(`${prefix}-${dashedName}`, this, Jellycat._factory.resolve(super.name))
			}
		}

		async connectedCallback()
		{
			if (Array.isArray(this._controlledAttributes) && this._controlledAttributes.length > 0) {
				this._mountMutationObserver()
			}

			this._runLifeCycle()
		}

		async disconnectedCallback()
		{ 
			if (this._mutationObserver) this._mutationObserver.disconnect()

			const instances = window.Jellycat._instances[this.constructor.name]
			window.Jellycat._instances[this.constructor.name] = instances.filter(component => component !== this)
		}

		_mountMutationObserver()
		{
			const camelToSlug = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

			this._mutationObserver = new MutationObserver(this._mutationObserverCallback)
			this._mutationObserver.observe(this, {
				attributes: true,
				attributeOldValue: true
			})

			this._controlledAttributes.forEach(attr => {
				Object.defineProperty(this, attr, {
					get: _ => this.getAttribute(camelToSlug(attr)),
					set: value => this.setAttribute(camelToSlug(attr), value)
				})
			})
		}

		_mutationObserverCallback(mutationList, observer)
		{
			const slugToCamel = str => str.toLowerCase().replace(/([-][a-z])/g, group => {
				return group.toUpperCase().replace('-', '')
			})

		    for (const mutation of mutationList)
		    {
		        if (mutation.type !== 'attributes') continue
		       	if (!mutation.target._controlledAttributes.includes(slugToCamel(mutation.attributeName))) continue

		       	const newValue = mutation.target.getAttribute(mutation.attributeName)
		       	const observeMethod = `${slugToCamel(mutation.attributeName)}ChangedCallback`

		       	if (undefined !== mutation.target[`__${observeMethod}`]) {
					mutation.target[`__${observeMethod}`](mutation.oldValue, newValue)
				}

				if (undefined !== mutation.target[observeMethod]) {
					mutation.target[observeMethod](mutation.oldValue, newValue)
				}
		    }
	    }
	}
}

mixins.lifeCycling = function(superclass)
{
	return class extends superclass
	{
		get keyLifeCycle() { 
			return ['down', 'init', 'render', 'behavior', 'up']
		}

		get currentLifeCycleIndex() {
			return this.keyLifeCycle.indexOf(this.currentLifeCycle)
		}

		async _runLifeCycle(since = false)
		{
			try
			{
				since !== false
					? this.currentLifeCycle = since
					: this.currentLifeCycle ??= this.keyLifeCycle[0]

				while(this.currentLifeCycleIndex < this.keyLifeCycle.length-1)
				{
					if (!(await this._runStep(this.currentLifeCycle))) {
						throw new Error(`LifeCycle ${this.currentLifeCycle} function of ${this.constructor.name} does not return true`)
					}

					this.currentLifeCycle = this.keyLifeCycle[this.currentLifeCycleIndex+1]
				}
			
			} catch(error) { console.log(error) }
		}

		async _runStep(lifeCycle)
		{
			if (['down', 'up'].includes(lifeCycle)) return true

			return new Promise(async (resolve, reject) => {
				const args = undefined !== this[`__${lifeCycle}`]
					? await this[`__${lifeCycle}`](await this[`_${lifeCycle}`]())
					: await this[`_${lifeCycle}`]()
				resolve(this.methods.includes(lifeCycle) ? await this[lifeCycle](...args) : [])
			})
		}

		async _init()
		{
			if (this.constructor.name in Jellycat._instances) {
				Jellycat._instances[this.constructor.name].push(this)
			}

			const options = this.getAttribute('options') ? JSON.parse(this.getAttribute('options')) : {}
			this.options = Object.assign(Jellycat._options, Jellycat._cache[this.constructor.name].options, options)

			return []
		}

		async _render()
		{
			if (this.constructor.name in Jellycat._cache && this.options.autoRender === 'root') {
				let template = this.drawTemplate()
				if (template && this.children.length > 0) this.innerHTML = ""
				if (template) this.appendChild(template)
			}

			return []
		}

		async _behavior()
		{
			this.mountTriggers()

			return [ Jellycat._scope ]
		}

		_checkLifeCycle(minLifeCycle, methodName)
		{
			if (this.currentLifeCycleIndex < this.keyLifeCycle.indexOf(minLifeCycle))  {
				throw new Error(`You cannot use ${methodName} method before render ${minLifeCycle} (current state: ${this.currentLifeCycle}) of lifeCycle of ${this.constructor.name}`)
			}
		}

		async rollBackToLifeCycle(lifeCycle)
		{
			if (this.currentLifeCycleIndex > this.keyLifeCycle.indexOf(lifeCycle)) {
				await this._runLifeCycle(lifeCycle)
			}
		}
	}
}

mixins.rendering = function(superclass)
{
	return class extends superclass
	{
		__templateChangedCallback(oldValue, newValue)
    	{
			this.rollBackToLifeCycle('render')
		}

		get template() {
			return this.getAttribute('template')
		}

		set template(template) {
			this.setAttribute('template', template)
			return true
		}

		get templatesCached()
		{
			return Object.keys(Jellycat._cache[this.constructor.name].templates)
		}

		draw(template = null, target = null)
		{
			this._checkLifeCycle('render', 'draw')
			
			const element = this.drawTemplate(template)
			target ??= this

			if (target.children.length > 0) {
				[...target.children].forEach(child => child.remove())
			}

			target.appendChild(element)
			return true
		}

		drawTemplate(template)
		{
			this._checkLifeCycle('render', 'drawTemplate')

			const name = !template ? (this.template == null ? 'root' : this.template) : template
			return name in Jellycat._cache[this.constructor.name].templates 
				? Jellycat._cache[this.constructor.name].templates[name].content.cloneNode(true)
				: false
		}

		drawElement(tagname, attrs = {}, children = [])
		{
			this._checkLifeCycle('render', 'drawElement')

			const element = document.createElement(tagname)
			for (const [key, value] of Object.entries(attrs)) { element.setAttribute(key, value) }

			children.forEach(child => typeof child === 'string'
				? element.textContent = child
				: element.appendChild(child)
			)

			return element
		}
	}
}

mixins.triggering = function(superclass)
{
	return class extends superclass
	{
		__bindChangedCallback(oldValue, newValue)
    	{
			console.log({ fn: '__bindChangedCallback', old: oldValue, new: newValue})
		}

		trigger(attr, element, value)
	    {
			if (attr === 'bind') {
				element.setAttribute(attr, value)
				this._triggerBind(element)
				return

			} else if (Jellycat._eventTriggers.includes(`on${attr}`)) {
				element.setAttribute(`on${attr}`, value)
				this._triggerEvent(`on${attr}`, element)
				return
			}

			throw new Error(`Attribute ${attr} is not a valid property of this component`)
	    }

	    _triggerBind(element)
	    {
	    	if (!element.getAttribute('bind').startsWith('this.')) return

	    	const byString = (object, propertyPath) => {

			    propertyPath = propertyPath.replace(/\[(\w+)\]/g, '.$1')
			    propertyPath = propertyPath.replace(/^\./, '')
			    let properties = propertyPath.split('.')

			    for (let i = 0; i < properties.length; ++i)
			    {
			        let property = properties[i]
			        if (property in object) {
			            object = object[property]
			            continue
			        }
			        
			        console.error(`Fill "bind" of ${object.constructor.name} failed, property ${property} not set.`)
			        return
			    }

				return object
			}

			const property = element.getAttribute('bind').substr(String('this.').length)

			if (!property.includes('.')) {
				this[`_${property}`] = this[property]
				delete this[property]
				Object.defineProperty(this, property, {
					set: value => {
						this[`_${property}`] = value
						element.innerHTML = value
					},
					get: _ => this[`_${property}`]
				})
			}

			// this._countVirtualized = this.countVirtualized
			// delete this.countVirtualized
			// Object.defineProperty(this, 'countVirtualized', {
			// 	set: value => {
			// 		this._countVirtualized = value
			// 		this.querySelector('[bind="this.countVirtualized"]').innerHTML = value
			// 	},
			// 	get: _ => this._countVirtualized
			// })

			element.innerHTML = byString(this, property)
	    }

	    _triggerEvent(attr, element)
	    {
	    	if (!element.getAttribute(attr).startsWith('this.')) return

			const methods = Object.getOwnPropertyNames(this).filter(fn => {
				return typeof this[fn] === 'function'
			})

			const fn = element.getAttribute(attr).substr(String('this.').length)
			if (typeof this[fn] !== 'function') {
				throw new Error(`Attribute ${attr} "${fn}" is not a valid methods of this component.\nAvailables : ${this.methods.concat(methods).join(', ')}\n`)
			}

			this[fn] = this[fn].bind(this)
			element.addEventListener(attr.substr(2), this[fn])
	    }

	    mountTriggers(parent = null)
	    {
	    	parent = parent === null ? this : parent

    		for (const element of [...parent.querySelectorAll('[bind]')])
			{
				this._triggerBind(element)
			}

	    	for (const attr of Jellycat._eventTriggers)
	    	{
	    		for (const element of [...parent.querySelectorAll(`[${attr}]`)])
				{
					this._triggerEvent(attr, element)
				}
	    	}
	    }
	}
}

mixins.scoping = function(superclass)
{
	return class extends superclass
	{
		get ancestor() {
			return this.getAncestorOf()
		}

		getAncestorOf(element = null)
		{
			const prefix = Jellycat._options.prefix

			let currentElement = element ?? this

			while(currentElement.tagName !== 'BODY' || currentElement === this)
			{
				currentElement = currentElement.parentElement
				if (currentElement.tagName.startsWith(`${prefix.toUpperCase()}-`) || currentElement.getAttribute('is')?.startsWith(`${prefix}-`)) {
					return currentElement
				}
			}

			return null
		}
	}
}

mixins.providing = function(superclass)
{
	return class extends superclass
	{
		get loading() {
			return this.hasAttribute('loading')
		}

		set loading(loading) {
			loading ? this.setAttribute('loading', '') : this.removeAttribute('loading')
			return true
		}

		async fetchData(url, method = 'GET', data = false)
		{
			this.loading = true
			const result = await Jellycat._fetchData(url, method, data)
			this.loading = false
			return result
		}
	}
}

window.Jellycat ??= new class Jellycat
{
	constructor()
	{
		this._options = { 
			prefix: 'jc',
			debug: false,
			autoRender: 'root',
			auth: {},
			fetch: {}
		}

		this._scope = {}
		this._instances = {}
		this._cache = {}

		this._eventTriggers = ['onclick', 'onchange', 'oninput', 'onresize', 'onscroll', 'onsubmit', 'onblur', 'onfocus']

		this._factory = {

			JcComponent: class JcComponent extends _(HTMLElement).with(...Object.values(mixins)) { 
				constructor(...ctrlAttrs) { super(); this._controlledAttributes = Array.from(new Set(ctrlAttrs.concat(['template', 'bind']))) }
			},
			JcDivComponent: class JcDivComponent extends _(HTMLDivElement).with(...Object.values(mixins)) { 
				constructor(...ctrlAttrs) { super(); this._controlledAttributes = Array.from(new Set(ctrlAttrs.concat(['template', 'bind']))) }
			},
			JcSpanComponent: class JcSpanComponent extends _(HTMLSpanElement).with(...Object.values(mixins)) { 
				constructor(...ctrlAttrs) { super(); this._controlledAttributes = Array.from(new Set(ctrlAttrs.concat(['template', 'bind']))) }
			},
			JcUlComponent: class JcUlComponent extends _(HTMLUListElement).with(...Object.values(mixins)) { 
				constructor(...ctrlAttrs) { super(); this._controlledAttributes = Array.from(new Set(ctrlAttrs.concat(['template', 'bind']))) }
			},
			JcLiComponent: class JcLiComponent extends _(HTMLLIElement).with(...Object.values(mixins)) { 
				constructor(...ctrlAttrs) { super(); this._controlledAttributes = Array.from(new Set(ctrlAttrs.concat(['template', 'bind']))) }
			},
			JcPComponent: class JcPComponent extends _(HTMLParagraphElement).with(...Object.values(mixins)) {
				constructor(...ctrlAttrs) { super(); this._controlledAttributes = Array.from(new Set(ctrlAttrs.concat(['template', 'bind']))) }
			},
			JcLabelComponent: class JcLabelComponent extends _(HTMLLabelElement).with(...Object.values(mixins)) { 
				constructor(...ctrlAttrs) { super(); this._controlledAttributes = Array.from(new Set(ctrlAttrs.concat(['template', 'bind']))) }
			},
			JcInputComponent: class JcInputComponent extends _(HTMLInputElement).with(...Object.values(mixins)) { 
				constructor(...ctrlAttrs) { super(); this._controlledAttributes = Array.from(new Set(ctrlAttrs.concat(['template', 'bind']))) }
			},
			JcTextareaComponent: class JcTextareaComponent extends _(HTMLTextAreaElement).with(...Object.values(mixins)) { 
				constructor(...ctrlAttrs) { super(); this._controlledAttributes = Array.from(new Set(ctrlAttrs.concat(['template', 'bind']))) }
			},
			JcTableComponent: class JcTableComponent extends _(HTMLTableElement).with(...Object.values(mixins)) {
				constructor(...ctrlAttrs) { super(); this._controlledAttributes = Array.from(new Set(ctrlAttrs.concat(['template', 'bind']))) }
			},
			JcTbodyComponent: class JcTbodyComponent extends _(HTMLTableSectionElement).with(...Object.values(mixins)) {
				constructor(...ctrlAttrs) { super(); this._controlledAttributes = Array.from(new Set(ctrlAttrs.concat(['template', 'bind']))) }
			},
			JcTrComponent: class JcTrComponent extends _(HTMLTableRowElement).with(...Object.values(mixins)) {
				constructor(...ctrlAttrs) { super(); this._controlledAttributes = Array.from(new Set(ctrlAttrs.concat(['template', 'bind']))) }
			},

			resolve: HtmlElement => {
				switch(HtmlElement)
				{
					case 'HTMLElement'                : return {}
					case 'HTMLDivElement'             : return { extends: 'div' }
					case 'HTMLSpanElement'            : return { extends: 'span' }
					case 'HTMLUListElement'           : return { extends: 'ul' }
					case 'HTMLLIElement'              : return { extends: 'li' }
					case 'HTMLParagraphElement'       : return { extends: 'p' }
					case 'HTMLLabelElement'           : return { extends: 'label' }
					case 'HTMLInputElement'           : return { extends: 'input' }
					case 'HTMLTextAreaElement'        : return { extends: 'textarea' }
					case 'HTMLTableElement'           : return { extends: 'table' }
					case 'HTMLTableSectionElement'    : return { extends: 'tbody' }
					case 'HTMLTableRowElement'        : return { extends: 'tr' }
				}
			},

			JcMixin: _
		}
	}

	options(options = {})
	{
		if (typeof options !== 'object') throw new Error('Options must take object as parameter type')
		this._options = Object.assign(this._options, options)
		return this
	}

	async authenticate(credentials = {})
	{
		if (this._options.auth.login === undefined) {
			throw new Error('You must define options auth.login first to use authenticate method')
		}

		const response = await this._fetchData(this._options.auth.login, 'POST', JSON.stringify(credentials))

		this._token = {
			value: response.token,
			key: this._options.auth.header != undefined 
				? this._options.auth.header 
				: 'Authorization'
		}

		return 'token' in response
			? { success: true }
			: { success: false, message: response.message }
	}

	async refresh()
	{
		if (this._options.auth.refresh === undefined) {
			throw new Error('You must define options auth.refresh first to use refresh method')
		}

		const response = await this._fetchData(this._options.auth.refresh, 'POST', false)
		if ('token' in response) {

			this._token = {
				value: response.token,
				key: this._options.auth.header != undefined 
					? this._options.auth.header 
					: 'Authorization'
			}

			return true
		}

		return false
	}

	async _fetchData(url, method = 'GET', data = false)
	{
		try
		{
			let preventRetry = [this._options.auth.refresh, this._options.auth.login].includes(url)

			let response = await fetch(url, this._buildRequest(method, data))

		    if (response.status === 401 && this._options.auth.refresh !== undefined && !preventRetry) {
		    	if (await this.refresh()) return await this._fetchData(url, method, data);
		    }

		    if (response.status >= 400) {
		    	throw new Error(`Fetch error - ${response.statusText}`);
		    }

			return await response.json()

		} catch(error) { return { error: error.message } }
	}

	_buildHeaders()
	{
		let headers = new Headers()

		headers.append("X-Requested-With", "XmlHttpRequest")
		headers.append("Content-Type", "application/json")
		headers.append("Accept", "application/json")

		if (this._token?.value) {
			headers.append(this._token.key, `${this._options.auth.type} ${this._token.value}`)
		}

		if (this._options.fetch?.headers?.length > 0) {
			this._options.fetch.headers.forEach(header => {
				headers.has(header.key)
					? headers.set(header.key, header.value)
					: headers.append(header.key, header.value)
			})
		}

		return headers
	}

	_buildRequest(method = 'GET', data = false)
	{
		let requestObj = { method: method, headers: this._buildHeaders() }

		if (this._options.fetch.mode != undefined) {
			requestObj.mode = this._options.fetch.mode
		}

		if (this._options.fetch.cache != undefined) {
			requestObj.cache = this._options.fetch.cache
		}

		if (data !== false) requestObj.body = data

		return requestObj
	}

	async _cacheSet(name, templatesUrl = [], options = {})
	{
		let templates = []

		for (const templateUrl of templatesUrl)
		{
			if (!templateUrl) continue

			let response = await fetch(templateUrl)
			if (response.status != 200) {
				throw new Error(`Template ${response.statusText} (${response.url})`)
			}

			const stringTemplate = await response.text()
			const html = new DOMParser().parseFromString(stringTemplate, 'text/html')
			templates = templates.concat(Array.from(html.querySelectorAll('template')))
		}

		if (templates.length > 0) {
			templates = templates.reduce((template, element) => {
				return { ...template, [element.id]: element }
			}, {})
		}
		
		if (!(name in this._instances)) this._instances[name] = []

		this._cache[name] = { 
			sources: templatesUrl,
			templates: templates,
			options: options
		}
	}
}

export const { 

	JcComponent,
	JcDivComponent,
	JcSpanComponent,
	JcUlComponent,
	JcLiComponent,
	JcPComponent,
	JcLabelComponent,
	JcInputComponent,
	JcTextareaComponent,
	JcTableComponent,
	JcTbodyComponent,
	JcTrComponent,
	JcMixin

} = Jellycat._factory