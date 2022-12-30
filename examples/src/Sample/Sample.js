'use strict'

import { JcComponent } from '../../../dist/bundle.esm.js'
import './Sample.css'

export default class Sample extends JcComponent
{
	constructor() { super(); if (Jellycat.options.debug) console.log(this.currentLifeCycle, 'component->construct()') }

	async init(conf)
	{
		if (Jellycat.options.debug) console.log(this.currentLifeCycle, 'component->init()')
		console.log(conf)
		return true
	}

	async render(templates)
	{
		if (Jellycat.options.debug) console.log(this.currentLifeCycle, 'component->render()')
		console.log(templates)
		return true
	}

	async behavior(scope)
	{
		if (Jellycat.options.debug) console.log(this.currentLifeCycle, 'component->behavior()')
		console.log(scope)
		return true
	}
}