'use strict'

import * as components from '../src/index.js'
import { defineFetch } from './_mocks.js'

beforeEach(() => 'fetch' in global ? fetch.mockClear() : null)

describe('Jellycat Fetching request', _ => {

	Jellycat.options({
        fetch: { headers: [ 
        	{ key: 'X-View-Request', value: 'TestViewRequest' } 
        ] }
	})

	it('_buildHeaders method should return Headers', function() {
		const headers = Jellycat._buildHeaders()
		expect(headers.constructor.name).toBe('Headers')
	})

	it('_buildRequest method should return an object with buildin properties', function() {
		const requestObj = Jellycat._buildRequest('POST', JSON.stringify({ test: 'foo' }))
		expect(typeof requestObj).toBe('object')
		expect(Object.keys(requestObj)).toEqual(expect.arrayContaining(['method', 'headers']))
	})

})

describe('Jellycat Fetching response', _ => {

	const goodResponse = JSON.stringify({ success: true })
	const badResponse = JSON.stringify({ error: 'Fetch error - undefined' })

	it('feetching data should return without errors', async function() {
		global.fetch = defineFetch(200, 'json', goodResponse)
		expect(await Jellycat._fetchData()).toBe(goodResponse)
	})

	it('feetching data should return with errors', async function() {
		
		global.fetch = defineFetch(400, 'json', goodResponse)
		expect(JSON.stringify(await Jellycat._fetchData())).toBe(badResponse)
	})

})