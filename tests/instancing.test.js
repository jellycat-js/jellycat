'use strict'

import { 

	components,
	beforeAllComponent,
	afterAllComponent, 
	component,
	ancestor

} from '../jest.setup.js'


describe.each(components)('Instancing - TestComponent extending from $_constructor_', ({ _constructor_, _instanceOf_, _class_ }) => {

	beforeAll(() => beforeAllComponent(_constructor_, _class_))
	afterAll(() => afterAllComponent())
	
	it(`Should extends from ${_constructor_}`, function() {
		expect(ancestor().constructor.name).toBe(_constructor_)
	})

	it(`Should have parent to extends of ${_instanceOf_.name}`, function() {
		expect(ancestor()).toBeInstanceOf(_instanceOf_)
	})

	it('Should be on its lifecycle "up"', function() {
		expect(component().currentLifeCycleIndex).toBe(4)
		expect(component().currentLifeCycle).toBe('up')
	})

	it('Should have its instance in global Jellycat object', function() {
		const componentName = component().constructor.name
		expect(Object.keys(Jellycat._instances)).toContain(componentName)
		expect(Jellycat._instances[componentName].length).toEqual(1)
		const instancedElement = Jellycat._instances[componentName][0]
		expect(instancedElement.constructor.name).toBe(componentName)
	})

	it('Should remove its instance from global Jellycat object when disconnect', function() {
		const componentName = component().constructor.name
		const clone = component().cloneNode(true)
		document.body.removeChild(component())
		expect(Jellycat._instances[componentName].length).toEqual(0)
		document.body.appendChild(clone)
	})

})
