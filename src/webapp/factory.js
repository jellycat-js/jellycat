'use strict'

import appTemplates from './jellycat-app.html'

export default function(superclass)
{
	return class extends superclass
	{
		__viewChangedCallback(oldValue, newValue)
    	{
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

	    	console.log('JcApp __init')
	    	return args
		}
	  
	    async __render(args)
	    {
	    	const viewContainer = this.querySelectorAll('[app-view]')
	    	
	    	switch(viewContainer.length)
	    	{
	    		case 0: throw new Error('jc-app DOM tree must contain an element with attribute "app-view"')
	    		case 1: break
	    		default: throw new Error('jc-app DOM tree must contain only one element with attribute "app-view"')
	    	}

	    	const view = this.router.resolve(window.location.pathname)
	    	this.view = view.template
	    	// console.log(this.router.resolve(window.location.pathname))

	    	// this.view = args.navigation.template
	    	// this.view.template
	    	// console.log(this.view)
	    	// mountView()
			// {
			// 	if (history.state == null || history.state.pathname != this.view.pathname) {
			// 		history.pushState(this.view, null, this.view.pathname)
			// 	}

			// 	return this.draw(this._view.template, this.querySelector('main'))
			// }

	    	// render view in [app-view]
	    	console.log('JcApp __render')
	    	return args
		}
	  
	    async __behavior(args)
		{
			console.log('JcApp __behavior')
			return args
		}

		// navigate(event)
		// {
		// 	if (event instanceof PopStateEvent) {
		// 		event.preventDefault()
		// 		this.view = this.router.resolve(event.state.pathname)
			
		// 	} else if (event instanceof PointerEvent) {
		// 		event.preventDefault()
		// 		this.view = event.currentTarget.tagName === 'A'
		// 			? this.router.resolve(event.currentTarget.getAttribute('href'))
		// 			: this.router.resolve(event.currentTarget.getAttribute('data-url'))
			
		// 	} else if (typeof event === 'string') {
		// 		this.view = this.router.resolve(event)
		// 	}
			
		// 	this.querySelector('cx-navigation').selectActiveItem(this.view.pathname)
		// }

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