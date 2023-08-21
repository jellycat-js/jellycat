'use strict'

import appTemplates from './jellycat-app.html'

export default function(superclass)
{
	return class extends superclass
	{
		__viewChangedCallback(oldValue, newValue)
    	{
    		let viewContainer = this.querySelectorAll('[app-view]')
	    	
	    	switch(viewContainer.length)
	    	{
	    		case 0  : throw new Error('jc-app DOM tree must contain an element with attribute "app-view"')
	    		case 1  : this.viewState.root =  viewContainer.item(0); break
	    		default : throw new Error('jc-app DOM tree must contain only one element with attribute "app-view"')
	    	}

    		// if (history.state == null || history.state.pathname != view.pathname) {
			// 	history.pushState(view.template, null, view.pathname)
			// }

	    	console.log(this.view, newValue)
			this.draw(newValue, this.viewState.root)
    		// this.rollBackToLifeCycle('render')
    		console.log('JcApp __viewChangedCallback', newValue)
		}

		async __init(args)
	    {
			const html = new DOMParser().parseFromString(appTemplates, 'text/html')
			
			let userTemplates = Jellycat._cache[this.constructor.name].templates
			let templates = Array.from(html.querySelectorAll('template')).concat(Object.values(userTemplates))

			Jellycat._cache[this.constructor.name].sources.push('./jellycat-app.html')
			Jellycat._cache[this.constructor.name].templates = templates.reduce((template, element) => {
				return { ...template, [element.id]: element }
			}, {})

			this.viewState = this.router.resolve(window.location.pathname)
			this.navigate = this.navigate.bind(this)

	    	console.log('JcApp __init')
	    	return args
		}
	  
	    async __render(args)
	    {
	    	this.view = this.viewState.template

	    	console.log('JcApp __render')
	    	return args
		}
	  
	    async __behavior(args)
		{
			window.addEventListener('popstate', this.navigate)
        	this.addEventListener('click', this.navigate) 

			console.log('JcApp __behavior')
			return args
		}

		navigate(e)
		{
			if (e instanceof PopStateEvent) {
				e.preventDefault()
				const resolved = this.router.resolve(e.state.pathname)
				this.viewState = Object.assign({}, this.viewState, resolved)
				this.view = this.viewState.template
				return
			}
			
			if (e instanceof PointerEvent) { // || TOUCH

				const target = e.target.tagName !== 'A' ? e.target.closest('a') : e.target
				if (!target) return

				const link = target.getAttribute('href')
				if (link === null || link.startsWith('#') || link.startsWith('http')) return

				e.preventDefault()
				history.pushState({}, '', link)

				const resolved = this.router.resolve(link.includes('#') ? link.split('#')[0] : link)
				this.viewState = Object.assign({}, this.viewState, resolved)
				this.view = this.viewState.template
				// this.hashScroll()
			}
		}

		router = {

			resolve(pathname)
			{
				let template = 'view_not_found'
				let parameters = {}

				for (const route of this.routes)
				{
					if (route.path.split('/').length < pathname.split('/').length) continue
					if (route.path === pathname) {
						template = route.template
						break
					}

					const params = this._getRouteParams(route.path)

					if (Object.keys(params).length > 0 && this._comparePaths(route.path, pathname, params)) {
						for (const [index, param] of Object.entries(params)) {
							parameters[param.name] = pathname.split('/')[index]
						}
						
						template = route.template
						break
					}
				}

				return { 
					pathname: pathname, 
					template: template, 
					parameters: parameters 
				}
			},

			_setRoutes(routes = [])
			{
				this.routes = routes.filter(route => route.path === '/').length === 0
					? [{ path: '/', template: 'wellcome' }].concat(routes)
					: routes
			},

			_getRouteParams(path)
			{
				let pathFragments = path.split('/')
				let routeParameters = {}

				pathFragments.forEach((fragment, index) => {
					if (fragment.charAt(0) === '{' && fragment.charAt(fragment.length-1) === '}') {
						let parameter = fragment.slice(1,-1)
						routeParameters[index] = parameter.charAt(parameter.length-1) === '?'
							? { nullable: true, name: parameter.slice(0,-1) }
							: { nullable: false, name: parameter }
					}
				})

				return routeParameters
			},

			_comparePaths(pathA, pathB, params)
			{
				for (let [index, fragment] of Object.entries(pathB.split('/')))
				{
					if (fragment === pathA.split('/')[index] || params[index]?.nullable) continue
					return false
				}
				
				return true
			}
		}
	}
}