'use strict'

import { 
	
	components,
	beforeAllComponent,
	afterAllComponent,
	component,
	ancestor

} from '../jest.setup.js'

describe.each(components)('Lifecycling - TestComponent extending from $_constructor_', ({ _constructor_, _instanceOf_, _class_ }) => {

	beforeAll(() => beforeAllComponent(_constructor_, _class_, _ => {
		component()._init = jest.fn(() => { return Promise.resolve([]) })
		component()._render = jest.fn(() => { return Promise.resolve([]) })
		component()._behavior = jest.fn(() => { return Promise.resolve([ Jellycat._scope ]) })
	}))

	afterAll(() => afterAllComponent( _ => {
		component()._init.mockClear()
		component()._render.mockClear()
		component()._behavior.mockClear()
	}))
	
	it('Should have gone through all its lifecycles', function() {
		expect(component()._init).toBeCalledTimes(1)
		expect(component()._render).toBeCalledTimes(1)
		expect(component()._behavior).toBeCalledTimes(1)
	})

})