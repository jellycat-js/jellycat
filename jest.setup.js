'use strict'

import '@testing-library/jest-dom'

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

} from './src/index.js'


const defineFetch = (statusCode, responseType, responseContent) => {
	return jest.fn(() => {
		let response = { status: statusCode }
		response[responseType] = _ => Promise.resolve(responseContent)
		return Promise.resolve(response)
	})
}

const beforeEachFetch = _ => {
	return 'fetch' in global ? fetch.mockClear() : null
}

const components = [
	{
	  	_constructor_: 'JcComponent', 
	  	_instanceOf_: HTMLElement, 
	  	_class_: class TestElement extends JcComponent { constructor() { super() } }
	},
	{
	  	_constructor_: 'JcDivComponent', 
	  	_instanceOf_: HTMLDivElement, 
	  	_class_: class TestDiv extends JcDivComponent { constructor() { super() } }
	},
	{
	  	_constructor_: 'JcSpanComponent', 
	  	_instanceOf_: HTMLSpanElement, 
	  	_class_: class TestSpan extends JcSpanComponent { constructor() { super() } }
	},
	{
	  	_constructor_: 'JcUlComponent', 
	  	_instanceOf_: HTMLUListElement, 
	  	_class_: class TestUl extends JcUlComponent { constructor() { super() } }
	},
	{
	  	_constructor_: 'JcLiComponent', 
	  	_instanceOf_: HTMLLIElement, 
	  	_class_: class TestLi extends JcLiComponent { constructor() { super() } }
	},
	{
	  	_constructor_: 'JcPComponent', 
	  	_instanceOf_: HTMLParagraphElement, 
	  	_class_: class TestP extends JcPComponent { constructor() { super() } }
	},
	{
	  	_constructor_: 'JcLabelComponent', 
	  	_instanceOf_: HTMLLabelElement, 
	  	_class_: class TestLabel extends JcLabelComponent { constructor() { super() } }
	},
	{
	  	_constructor_: 'JcInputComponent', 
	  	_instanceOf_: HTMLInputElement, 
	  	_class_: class TestInput extends JcInputComponent { constructor() { super() } }
	},
	{
	  	_constructor_: 'JcTextareaComponent', 
	  	_instanceOf_: HTMLTextAreaElement, 
	  	_class_: class TestTextarea extends JcTextareaComponent { constructor() { super() } }
	}
]

const beforeAllComponent = (_constructor_, _class_, mocks) => {

	const tag = _constructor_.slice(2, -9).toLowerCase()
	const element = tag.length > 0
		? document.createElement(tag, { is: `jc-test-${tag}`})
		: document.createElement(`jc-test-element`)

	document.body.appendChild(element)

	if (typeof mocks === 'function') mocks()

	_class_.define()
}

const afterAllComponent = mocks => {
	while (document.body.firstChild) {
		if (typeof mocks === 'function') mocks()
		document.body.removeChild(document.body.firstChild)
	}
}

const fakeOption = type => {
	switch(type)
	{
		case 'auth' : return {
	        login: '/api/login_check',
	        refresh: '/api/token/refresh',
	        type: 'Bearer'
	    }
		case 'fetch': return {
            headers: [
                { key: 'X-View-Request', value: 'TestViewRequest' }
            ]
		}
	}
}

const fakePayload = type => {
	switch(type)
	{
		case 'token' : return { token: 'secret' }
		default      : return {}
	}
}

const fakeResponse = type => {
	switch(type)
	{
		case 'good'     : return JSON.stringify({ success: true })
		case 'bad'      : return JSON.stringify({ success: false, message: undefined }) 
		case 'badFetch' : return JSON.stringify({ error: 'Fetch error - undefined' })
	}
}

const component = _ => document.body.firstChild

const ancestor  = _ => Object.getPrototypeOf(Object.getPrototypeOf(document.body.firstChild))

export {
	defineFetch,
	beforeEachFetch,
	components, 
	beforeAllComponent,
	afterAllComponent,
	fakeOption,
	fakePayload,
	fakeResponse,
	component,
	ancestor
}