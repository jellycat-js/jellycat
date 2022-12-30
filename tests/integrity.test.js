'use strict'

describe('Integrity - Jellycat', _ => {

	it('should be not undefined and type be object', function() {
		expect(Jellycat).toBeDefined()
		expect(typeof Jellycat).toBe('object')
	})

	it('should have buildin properties', function() {
		const buildinProperties = expect.arrayContaining(['_options', '_scope', '_instances', '_cache', '_factory'])
		expect(Object.keys(Jellycat)).toEqual(buildinProperties)
	})

	describe('Integrity - Jellycat Factory', _ => {

		it('Should have 11 properties', function() {
			expect(Object.keys(Jellycat._factory).length).toEqual(11)
		})

		it('Should have only properties of type function', function() {
			const typeOfProperties = Object.values(Jellycat._factory).map(val => typeof val)
			expect([...new Set(typeOfProperties)]).toStrictEqual(['function'])
		})

		it('Should have 9 component functions', function() {
			const componentFunctions = Object.keys(Jellycat._factory).filter(key => {
				return key.startsWith('Jc') && key.endsWith('Component')
			})
			expect(componentFunctions.length).toEqual(9)
		})

		it('Should have JcMixin function', function() {
			expect(Object.keys(Jellycat._factory)).toContain('JcMixin')
		})

		it('Should have resolve function', function() {
			expect(Object.keys(Jellycat._factory)).toContain('resolve')
		})

	})
})


