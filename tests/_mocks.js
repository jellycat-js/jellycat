'use strict'

const defineFetch = (statusCode, responseType, responseContent) => {
	return jest.fn(() => {
		let response = { status: statusCode }
		response[responseType] = _ => Promise.resolve(responseContent)
		return Promise.resolve(response)
	})
}

export { defineFetch }