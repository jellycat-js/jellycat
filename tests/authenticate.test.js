'use strict'

import { 

	defineFetch, 
	beforeEachFetch, 
	fakeOption,
	fakePayload,
	fakeResponse

} from '../jest.setup.js'

describe('Authenticate - Jellycat Authenticate', _ => {

	beforeEach(() => beforeEachFetch())

	it('authenticate method called when missing options.auth.login', async function() {
		Jellycat.options({ auth: {} })
		const error = new Error('You must define options auth.login first to use authenticate method')
		await expect(Jellycat.authenticate()).rejects.toThrow(error)
	})

	it('authenticate method return without errors', async function() {
		Jellycat.options({ auth: fakeOption('auth') })

		global.fetch = defineFetch(200, 'json', fakePayload('token'))
		const response = JSON.stringify(await Jellycat.authenticate())
		expect(response).toBe(fakeResponse('good'))
	})

	it('authenticate method return with errors', async function() {
		Jellycat.options({ auth: fakeOption('auth') })

		global.fetch = defineFetch(400, 'json', fakePayload())
		const response = JSON.stringify(await Jellycat.authenticate())
		expect(response).toBe(fakeResponse('bad'))
	})

})

describe('Authenticate - Jellycat Refresh', _ => {

	beforeEach(() => beforeEachFetch())

	it('refresh method called when missing options.auth.refresh', async function() {
		Jellycat.options({ auth: {} })
		const error = new Error('You must define options auth.refresh first to use refresh method')
		await expect(Jellycat.refresh()).rejects.toThrow(error)
	})

	it('refresh method return without errors', async function() {
		Jellycat.options({ auth: fakeOption('auth') })

		global.fetch = defineFetch(200, 'json', fakePayload('token'))
		const response = await Jellycat.refresh()
		expect(response).toBeTruthy()
	})

	it('refresh method return with errors', async function() {
		Jellycat.options({ auth: fakeOption('auth') })

		global.fetch = defineFetch(400, 'json', fakePayload())
		const response = await Jellycat.refresh()
		expect(response).toBeFalsy()
	})

})