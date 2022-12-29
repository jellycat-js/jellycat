'use strict'

import * as components from '../src/index.js'

describe('Jellycat Framework Integrity', _ => {

	it('should be not undefined and type be object', function() {
		expect(Jellycat).toBeDefined()
		expect(typeof Jellycat).toBe('object')
	})

	it('should have buildin properties', function() {
		const buildinProperties = expect.arrayContaining(['_options', '_scope', '_instances', '_cache', '_factory'])
		expect(Object.keys(Jellycat)).toEqual(buildinProperties)
	})

})