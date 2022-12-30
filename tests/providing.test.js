'use strict'

import { 

	defineFetch,
	beforeEachFetch,
	fakeOption,
	fakeResponse

} from '../jest.setup.js'


describe('Providing - Jellycat Fetching Request', _ => {

	beforeAll(() => {
		Jellycat.options({ fetch: fakeOption('fetch') })
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

describe('Providing - Jellycat Fetching Response', _ => {

	beforeEach(() => beforeEachFetch())

	it('feetching data should return without errors', async function() {
		global.fetch = defineFetch(200, 'json', fakeResponse('good'))
		expect(await Jellycat._fetchData()).toBe(fakeResponse('good'))
	})

	it('feetching data should return with errors', async function() {
		
		global.fetch = defineFetch(400, 'json', fakeResponse('good'))
		expect(JSON.stringify(await Jellycat._fetchData())).toBe(fakeResponse('badFetch'))
	})

})