'use strict'

import { JcComponent } from '../../../dist/bundle.esm.js'
import './Tabs.css'

export default class Tabs extends JcComponent
{
	constructor() { super() }

	get active() {
		return this.hasAttribute('active')
			? this.getAttribute('active')
			: "1"
	}

	set active(active) {
		this.setAttribute('active', active)
		return true
	}

	async init(conf)
	{
		this.switchTab = this.switchTab.bind(this)

		this.tabs = Array.from(this.querySelectorAll('[tab]')).map(tab => {
			return { 
				title: tab.getAttribute('title'), 
				index: parseInt(tab.getAttribute('tab')), 
				html: tab.cloneNode(true)
			}
		}).sort((a, b) => {
	        let x = a.index, y = b.index
	        return ((x < y) ? -1 : ((x > y) ? 1 : 0))
   		 })

		this.innerHTML = ""
		return true
	}

	async render(templates)
	{
		this.tabs/*.reverse()*/.forEach((tab, i) => {

			if (this.active === i) tab.html.setAttribute('active', '')
			this.querySelector('.tabs__content').appendChild(tab.html)

			const headerItem = this.drawElement('li', this.active === i ? {tab: i, active: ''} : { tab: i }, [ String(tab.title) ])
			headerItem.addEventListener('click', this.switchTab)
			this.querySelector('.tabs__tabs').appendChild(headerItem)
		})

		this.querySelector('.tabs__tabs > li').setAttribute('active', '')
		this.querySelector('.tabs__content > *').setAttribute('active', '')

		return true
	}

	async behavior(scope)
	{
		return true
	}

	switchTab({ currentTarget })
	{
		if (currentTarget.hasAttribute('active')) return
		const newActive = currentTarget.getAttribute('tab')

		Array.from(this.querySelectorAll(`[tab]`)).forEach(t => t.removeAttribute('active'))
		this.querySelector(`.tabs__tabs > [tab="${newActive}"]`).setAttribute('active', '')
		this.querySelector(`.tabs__content > [tab="${newActive}"]`).setAttribute('active', '')

		this.active = newActive
	}
}