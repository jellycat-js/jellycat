'use strict'

import { 
	JcComponent, 
	JcDivComponent, 
	JcSpanComponent,
	JcUlComponent,
	JcLiComponent,
	JcPComponent,
	JcLabelComponent,
	JcInputComponent,
	JcTextareaComponent
} from '../src/index.js'


const component = _ => document.body.firstChild
const ancestor  = _ => Object.getPrototypeOf(Object.getPrototypeOf(component()))


describe('Factory - Integrity', _ => {

	it('Should have 11 properties', function() {
		expect(Object.keys(Jellycat._factory).length).toEqual(11)
	})

	it('Should have only function properties', function() {
		const typeOfProperties = Object.values(Jellycat._factory).map(val => typeof val)
		expect([...new Set(typeOfProperties)]).toStrictEqual(['function'])
	})

	it('Should have 9 component function', function() {
		const componentFunctions = Object.keys(Jellycat._factory).filter(key => {
			return key.startsWith('Jc') && key.endsWith('Component')
		})
		expect(componentFunctions.length).toEqual(9)
	})

	it('Should have JcMixin function', function() {
		expect(Object.keys(Jellycat._factory)).toContain('JcMixin')
	})

	it('Should have resolve (tag) function', function() {
		expect(Object.keys(Jellycat._factory)).toContain('resolve')
	})

})

describe.each([

	{
	  	_constructor_: 'JcComponent', 
	  	_instanceOf_: HTMLElement, 
	  	_class_: class TestElement extends JcComponent { constructor() { super() } },
	  	_tag_: false
	},

	{
	  	_constructor_: 'JcDivComponent', 
	  	_instanceOf_: HTMLDivElement, 
	  	_class_: class TestDiv extends JcDivComponent { constructor() { super() } },
	  	_tag_: 'div'
	},

	{
	  	_constructor_: 'JcSpanComponent', 
	  	_instanceOf_: HTMLSpanElement, 
	  	_class_: class TestSpan extends JcSpanComponent { constructor() { super() } },
	  	_tag_: 'span'
	},

	{
	  	_constructor_: 'JcUlComponent', 
	  	_instanceOf_: HTMLUListElement, 
	  	_class_: class TestUl extends JcUlComponent { constructor() { super() } },
	  	_tag_: 'ul'
	},

	{
	  	_constructor_: 'JcLiComponent', 
	  	_instanceOf_: HTMLLIElement, 
	  	_class_: class TestLi extends JcLiComponent { constructor() { super() } },
	  	_tag_: 'li'
	},

	{
	  	_constructor_: 'JcPComponent', 
	  	_instanceOf_: HTMLParagraphElement, 
	  	_class_: class TestP extends JcPComponent { constructor() { super() } },
	  	_tag_: 'p'
	},

	{
	  	_constructor_: 'JcLabelComponent', 
	  	_instanceOf_: HTMLLabelElement, 
	  	_class_: class TestLabel extends JcLabelComponent { constructor() { super() } },
	  	_tag_: 'label'
	},

	{
	  	_constructor_: 'JcInputComponent', 
	  	_instanceOf_: HTMLInputElement, 
	  	_class_: class TestInput extends JcInputComponent { constructor() { super() } },
	  	_tag_: 'input'
	},

	{
	  	_constructor_: 'JcTextareaComponent', 
	  	_instanceOf_: HTMLTextAreaElement, 
	  	_class_: class TestTextarea extends JcTextareaComponent { constructor() { super() } },
	  	_tag_: 'textarea'
	},

])('Factory - Build $_constructor_', ({ _constructor_, _instanceOf_, _class_, _tag_ }) => {

	beforeAll(() => {

		const element = _tag_ 
			? document.createElement(_tag_, { is: `jc-test-${_tag_}`})
			: document.createElement(`jc-test-element`)

		document.body.appendChild(element)

		_class_.define()
	})

	afterAll(() => {
		while (document.body.firstChild) {
			document.body.removeChild(document.body.firstChild)
		}
	})
	
	it(`Should extends from ${_constructor_}`, function() {
		expect(ancestor().constructor.name).toBe(_constructor_)
	})

	it(`Should have parent to extends of ${Object.keys({_instanceOf_})[0]}`, function() {
		expect(ancestor()).toBeInstanceOf(_instanceOf_)
	})

	it('Should is on lifecycle "up" (4)', function() {
		expect(component().currentLifeCycleIndex).toBe(4)
		expect(component().currentLifeCycle).toBe('up')
	})

	it('Should have its instance in global Jellycat object', function() {
		expect(Object.keys(Jellycat._instances)).toContain(component().constructor.name)
	})
})

// describe('Factory - JcComponent', _ => {

// 	beforeAll(() => {
// 		class TestElement extends JcComponent { constructor() { super() } }
// 		document.body.appendChild(document.createElement('jc-test-element'))
// 		TestElement.define()
// 	})

// 	afterAll(() => {
// 		while (document.body.firstChild) {
// 			document.body.removeChild(document.body.firstChild)
// 		}
// 	})

// 	it('Should extends of JcComponent', function() {
// 		expect(ancestor().constructor.name).toBe('JcComponent')
// 	})
	
// 	it('Should have parent to extends from HTMLElement', function() {
// 		expect(ancestor()).toBeInstanceOf(HTMLElement)
// 	})

// 	it('Should is on lifecycle "up" (4)', function() {
// 		expect(component().currentLifeCycleIndex).toBe(4)
// 		expect(component().currentLifeCycle).toBe('up')
// 	})

// 	it('Should have its instance in global Jellycat object', function() {
// 		expect(Object.keys(Jellycat._instances)).toContain(component().constructor.name)
// 	})
// })

// describe('Factory - JcDivComponent', _ => {

// 	beforeAll(() => {
// 		class TestDiv extends JcDivComponent { constructor() { super() } }
// 		document.body.appendChild(document.createElement('div', { is: 'jc-test-div' }))
// 		TestDiv.define()
// 	})

// 	afterAll(() => {
// 		while (document.body.firstChild) {
// 			document.body.removeChild(document.body.firstChild)
// 		}
// 	})
	
// 	it('Should extends from JcDivComponent', function() {
// 		expect(ancestor().constructor.name).toBe('JcDivComponent')
// 	})

// 	it('Should have parent to extends of HTMLDivElement', function() {
// 		expect(ancestor()).toBeInstanceOf(HTMLDivElement)
// 	})

// 	it('Should is on lifecycle "up" (4)', function() {
// 		expect(component().currentLifeCycleIndex).toBe(4)
// 		expect(component().currentLifeCycle).toBe('up')
// 	})

// 	it('Should have its instance in global Jellycat object', function() {
// 		expect(Object.keys(Jellycat._instances)).toContain(component().constructor.name)
// 	})
// })

// describe('Factory - JcSpanComponent', _ => {

// 	beforeAll(() => {
// 		class TestSpan extends JcSpanComponent { constructor() { super() } }
// 		document.body.appendChild(document.createElement('span', { is: 'jc-test-span' }))
// 		TestSpan.define()
// 	})

// 	afterAll(() => {
// 		while (document.body.firstChild) {
// 			document.body.removeChild(document.body.firstChild)
// 		}
// 	})
	
// 	it('Should extends from JcSpanComponent', function() {
// 		expect(ancestor().constructor.name).toBe('JcSpanComponent')
// 	})

// 	it('Should have parent to extends of HTMLSpanElement', function() {
// 		expect(ancestor()).toBeInstanceOf(HTMLSpanElement)
// 	})

// 	it('Should is on lifecycle "up" (4)', function() {
// 		expect(component().currentLifeCycleIndex).toBe(4)
// 		expect(component().currentLifeCycle).toBe('up')
// 	})

// 	it('Should have its instance in global Jellycat object', function() {
// 		expect(Object.keys(Jellycat._instances)).toContain(component().constructor.name)
// 	})
// })

// describe('Factory - JcUlComponent', _ => {

// 	beforeAll(() => {
// 		class TestUl extends JcUlComponent { constructor() { super() } }
// 		document.body.appendChild(document.createElement('ul', { is: 'jc-test-ul' }))
// 		TestUl.define()
// 	})

// 	afterAll(() => {
// 		while (document.body.firstChild) {
// 			document.body.removeChild(document.body.firstChild)
// 		}
// 	})
	
// 	it('Should extends from JcUlComponent', function() {
// 		expect(ancestor().constructor.name).toBe('JcUlComponent')
// 	})

// 	it('Should have parent to extends of HTMLUListElement', function() {
// 		expect(ancestor()).toBeInstanceOf(HTMLUListElement)
// 	})

// 	it('Should is on lifecycle "up" (4)', function() {
// 		expect(component().currentLifeCycleIndex).toBe(4)
// 		expect(component().currentLifeCycle).toBe('up')
// 	})

// 	it('Should have its instance in global Jellycat object', function() {
// 		expect(Object.keys(Jellycat._instances)).toContain(component().constructor.name)
// 	})

// })

// describe('Factory - JcLiComponent', _ => {

// 	beforeAll(() => {
// 		class TestLi extends JcLiComponent { constructor() { super() } }
// 		document.body.appendChild(document.createElement('li', { is: 'jc-test-li' }))
// 		TestLi.define()
// 	})

// 	afterAll(() => {
// 		while (document.body.firstChild) {
// 			document.body.removeChild(document.body.firstChild)
// 		}
// 	})
	
// 	it('Should extends from JcLiComponent', function() {
// 		expect(ancestor().constructor.name).toBe('JcLiComponent')
// 	})

// 	it('Should have parent to extends of HTMLLIElement', function() {
// 		expect(ancestor()).toBeInstanceOf(HTMLLIElement)
// 	})

// 	it('Should is on lifecycle "up" (4)', function() {
// 		expect(component().currentLifeCycleIndex).toBe(4)
// 		expect(component().currentLifeCycle).toBe('up')
// 	})

// 	it('Should have its instance in global Jellycat object', function() {
// 		expect(Object.keys(Jellycat._instances)).toContain(component().constructor.name)
// 	})

// })

// describe('Factory - JcPComponent', _ => {

// 	beforeAll(() => {
// 		class TestP extends JcPComponent { constructor() { super() } }
// 		document.body.appendChild(document.createElement('p', { is: 'jc-test-p' }))
// 		TestP.define()
// 	})

// 	afterAll(() => {
// 		while (document.body.firstChild) {
// 			document.body.removeChild(document.body.firstChild)
// 		}
// 	})
	
// 	it('Should extends from JcPComponent', function() {
// 		expect(ancestor().constructor.name).toBe('JcPComponent')
// 	})

// 	it('Should have parent to extends of HTMLParagraphElement', function() {
// 		expect(ancestor()).toBeInstanceOf(HTMLParagraphElement)
// 	})

// 	it('Should is on lifecycle "up" (4)', function() {
// 		expect(component().currentLifeCycleIndex).toBe(4)
// 		expect(component().currentLifeCycle).toBe('up')
// 	})

// 	it('Should have its instance in global Jellycat object', function() {
// 		expect(Object.keys(Jellycat._instances)).toContain(component().constructor.name)
// 	})

// })

// describe('Factory - JcLabelComponent', _ => {

// 	beforeAll(() => {
// 		class TestLabel extends JcLabelComponent { constructor() { super() } }
// 		document.body.appendChild(document.createElement('label', { is: 'jc-test-label' }))
// 		TestLabel.define()
// 	})

// 	afterAll(() => {
// 		while (document.body.firstChild) {
// 			document.body.removeChild(document.body.firstChild)
// 		}
// 	})
	
// 	it('Should extends from JcLabelComponent', function() {
// 		expect(ancestor().constructor.name).toBe('JcLabelComponent')
// 	})

// 	it('Should have parent to extends of HTMLLabelElement', function() {
// 		expect(ancestor()).toBeInstanceOf(HTMLLabelElement)
// 	})

// 	it('Should is on lifecycle "up" (4)', function() {
// 		expect(component().currentLifeCycleIndex).toBe(4)
// 		expect(component().currentLifeCycle).toBe('up')
// 	})

// 	it('Should have its instance in global Jellycat object', function() {
// 		expect(Object.keys(Jellycat._instances)).toContain(component().constructor.name)
// 	})

// })

// describe('Factory - JcInputComponent', _ => {

// 	beforeAll(() => {
// 		class TestInput extends JcInputComponent { constructor() { super() } }
// 		document.body.appendChild(document.createElement('input', { is: 'jc-test-input' }))
// 		TestInput.define()
// 	})

// 	afterAll(() => {
// 		while (document.body.firstChild) {
// 			document.body.removeChild(document.body.firstChild)
// 		}
// 	})
	
// 	it('Should extends from JcInputComponent', function() {
// 		expect(ancestor().constructor.name).toBe('JcInputComponent')
// 	})

// 	it('Should have parent to extends of HTMLInputElement', function() {
// 		expect(ancestor()).toBeInstanceOf(HTMLInputElement)
// 	})

// 	it('Should is on lifecycle "up" (4)', function() {
// 		expect(component().currentLifeCycleIndex).toBe(4)
// 		expect(component().currentLifeCycle).toBe('up')
// 	})

// 	it('Should have its instance in global Jellycat object', function() {
// 		expect(Object.keys(Jellycat._instances)).toContain(component().constructor.name)
// 	})

// })

// describe('Factory - JcTextareaComponent', _ => {

// 	beforeAll(() => {
// 		class TestTextarea extends JcTextareaComponent { constructor() { super() } }
// 		document.body.appendChild(document.createElement('textarea', { is: 'jc-test-textarea' }))
// 		TestTextarea.define()
// 	})

// 	afterAll(() => {
// 		while (document.body.firstChild) {
// 			document.body.removeChild(document.body.firstChild)
// 		}
// 	})
	
// 	it('Should extends from JcTextareaComponent', function() {
// 		expect(ancestor().constructor.name).toBe('JcTextareaComponent')
// 	})

// 	it('Should have parent to extends of HTMLTextAreaElement', function() {
// 		expect(ancestor()).toBeInstanceOf(HTMLTextAreaElement)
// 	})

// 	it('Should is on lifecycle "up" (4)', function() {
// 		expect(component().currentLifeCycleIndex).toBe(4)
// 		expect(component().currentLifeCycle).toBe('up')
// 	})

// 	it('Should have its instance in global Jellycat object', function() {
// 		expect(Object.keys(Jellycat._instances)).toContain(component().constructor.name)
// 	})

// })
