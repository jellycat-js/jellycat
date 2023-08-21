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

			Jellycat._cache[this.constructor.name].source.push('./jellycat-app.html')
			Jellycat._cache[this.constructor.name].templates = templates.reduce((template, element) => {
				return { ...template, [element.id]: element }
			}, {})

	    	console.log(this._router.resolve(window.location.pathname, window.location.hash))
			// this.navigate = this.navigate.bind(this)
			// this._view = this.router.resolve(window.location.pathname)

	    	console.log('JcApp __init')
	    	return args
		}
	  
	    async __render(args)
	    {
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

		_loader = {

			loadTemplates()
			{
				
			}
		}

		_router = {

			resolve(pathname, hash)
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