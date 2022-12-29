'use strict'

import * as components from '../src/index.js'
import { defineFetch } from './_mocks.js'

beforeEach(() => 'fetch' in global ? fetch.mockClear() : null)

const buildAuthOptions = empty => {
	Jellycat.options({
	    auth: empty ? {} : {
	        login: '/api/login_check',
	        refresh: '/api/token/refresh',
	        type: 'Bearer'
	    }
	})
}

const payloadToken = {token: 'secret'}
const payloadEmpty = {}

describe('Jellycat Auth Authenticate', _ => {

	const goodResponse = JSON.stringify({success: true})
	const badResponse = JSON.stringify({success: false, message: undefined})

	it('authenticate method called when missing options.auth.login', async function() {
		buildAuthOptions(true)
		const error = new Error('You must define options auth.login first to use authenticate method')
		await expect(Jellycat.authenticate()).rejects.toThrow(error)
	})

	it('authenticate method return without errors', async function() {
		buildAuthOptions(false)
		global.fetch = defineFetch(200, 'json', payloadToken)
		const response = JSON.stringify(await Jellycat.authenticate())
		expect(response).toBe(goodResponse)
	})

	it('authenticate method return with errors', async function() {
		buildAuthOptions(false)
		global.fetch = defineFetch(400, 'json', payloadEmpty)
		const response = JSON.stringify(await Jellycat.authenticate())
		expect(response).toBe(badResponse)
	})

})

describe('Jellycat Auth Refresh', _ => {

	it('refresh method called when missing options.auth.refresh', async function() {
		buildAuthOptions(true)
		const error = new Error('You must define options auth.refresh first to use refresh method')
		await expect(Jellycat.refresh()).rejects.toThrow(error)
	})

	it('refresh method return without errors', async function() {
		buildAuthOptions(false)
		global.fetch = defineFetch(200, 'json', payloadToken)
		const response = await Jellycat.refresh()
		expect(response).toBeTruthy()
	})

	it('refresh method return with errors', async function() {
		buildAuthOptions(false)
		global.fetch = defineFetch(400, 'json', payloadEmpty)
		const response = await Jellycat.refresh()
		expect(response).toBeFalsy()
	})

})