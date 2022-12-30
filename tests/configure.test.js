'use strict'

import { 

	fakeOption 

} from '../jest.setup.js'


describe('Configure - Jellycat Options', _ => {

	it('should be not undefined and type be object', function() {
		expect(Jellycat._options).toBeDefined()
		expect(typeof Jellycat._options).toBe('object')
	})

	it('should have buildin properties', function() {
		const buildinProperties = expect.arrayContaining(['prefix', 'debug', 'autoRender', 'auth', 'fetch'])
		expect(Object.keys(Jellycat._options)).toEqual(buildinProperties)
	})

	it('option method should overwrite default options', function() {
		const defaultOptions = Object.assign({}, Jellycat._options)

		Jellycat.options({
			prefix: 'test',
	        debug: true,
	        autoRender: 'base',
	        auth: fakeOption('auth'),
            fetch: fakeOption('fetch')
		})

		expect(defaultOptions.prefix).not.toBe(Jellycat._options.prefix)
		expect(defaultOptions.debug).not.toBe(Jellycat._options.debug)
		expect(defaultOptions.autoRender).not.toBe(Jellycat._options.autoRender)
		expect(defaultOptions.auth).not.toBe(Jellycat._options.auth)
		expect(defaultOptions.fetch).not.toBe(Jellycat._options.fetch)
	})

})