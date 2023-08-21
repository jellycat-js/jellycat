'use strict'

import templates from './templates.html'

console.log(templates)

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
	    	console.log(__dirname)
	    	// await Jellycat._cacheSet(this.name, './template.html', this.options)

	    	console.log(this.router.resolve(window.location.pathname, window.location.hash))
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

		router = {

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