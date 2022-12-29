'use strict'

import * as components from '../src/index.js'
import { defineFetch } from './_mocks.js'

beforeEach(() => 'fetch' in global ? fetch.mockClear() : null)

describe('Jellycat Framework caching', _ => {

	it('_cacheSet method should add template to cache', async function() {
		global.fetch = defineFetch(200, 'text', '<template id="test"></template')
		await Jellycat._cacheSet('test', '/test.html', {})
		expect(Object.keys(Jellycat._cache)).toContain('test')
		expect(Object.keys(Jellycat._cache.test)).toEqual(expect.arrayContaining(['source', 'templates', 'options']))
	})

})