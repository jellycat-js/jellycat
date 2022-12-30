'use strict'

import { 

	defineFetch, 
	beforeEachFetch,
	components, 
	beforeAllComponent,
	afterAllComponent,
	component,
	ancestor

} from '../jest.setup.js'


describe('Templating - Jellycat caching', _ => {

	beforeEach(() => beforeEachFetch())

	it('_cacheSet method should add template to cache', async function() {
		global.fetch = defineFetch(200, 'text', '<template id="test"></template')
		await Jellycat._cacheSet('test', '/test.html', {})
		expect(Object.keys(Jellycat._cache)).toContain('test')
		expect(Object.keys(Jellycat._cache.test)).toEqual(expect.arrayContaining(['source', 'templates', 'options']))
	})

})

describe.each(components)('Templating - TestComponent extending from $_constructor_', ({ _constructor_, _instanceOf_, _class_ }) => {

	beforeAll(() => beforeAllComponent(_constructor_, _class_))
	afterAll(() => afterAllComponent())

	describe('Templating Method - drawElement', _ => {

		it('Should have template property', function() {
			const testTemplate = 'test'
 			component().template = testTemplate
			expect(component().template).toEqual(testTemplate)
		})

		it('Should be able to draw element', function() {
			const element = component().drawElement('h2', { class: 'title' }, [ "I'm a Title!"	])
			component().appendChild(element)
			expect(element).toBeInTheDocument()
			expect(element).toHaveTextContent("I'm a Title!")
			expect(element).toHaveClass('title')
			expect(element).toBeInstanceOf(HTMLHeadingElement)
		})

		it('Should be able to draw embed elements', function() {
			const element = component().drawElement('header', { id: 'brand' }, [
				component().drawElement('h1', { class: 'title' }, [
					'Jellycat', component().drawElement('span', { 'data-color': 'primary' }, ['.js'])
				])
			])
			component().appendChild(element)
			const deepChild = document.body.querySelector('h1 > span')
			expect(element).toBeInTheDocument()
			expect(element).toContainElement(deepChild)
			expect(deepChild).toHaveAttribute('data-color', 'primary')
			expect(element).toHaveAttribute('id', 'brand')
			expect(element).toBeInstanceOf(HTMLElement)
		})

		it('Should', function() {
			// console.log(component().templatesCached)
			// tester si template cached
			// console.log(component().draw())
			// tester si draw
		})
	})

})