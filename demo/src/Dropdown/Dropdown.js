'use strict'

import { JcComponent } from '../../../dist/bundle.esm.js'
import './Dropdown.css'

export default class Dropdown extends JcComponent
{
	constructor() { super() }

	get active() {
		return this.hasAttribute('active')
	}

	set active(bool) {
		bool ? this.setAttribute('active', '') : this.removeAttribute('active')
		return bool
	}

	get items() {
		const items = JSON.parse(decodeURI(this.getAttribute('items')))
		this.removeAttribute('items')
		return items
	}

	set items(items) {
		return false
	}

	get icon() {
		return this.getAttribute('icon')
	}

	set icon(icon) {
		this.setAttribute('icon', icon)
		return true
	}

	get title() {
		return this.getAttribute('title')
	}

	set title(title) {
		this.setAttribute('title', title)
		return true
	}

	async init()
	{
		this.baseHTML = this.innerHTML
		this.icons = { active: null, inactive: null }
		return true
	}

	async render()
	{
		this.querySelector('.dropdown__icon').appendChild(this.createIcon())

		if (typeof this.title === 'string') {
			this.querySelector('.dropdown__title').textContent = this.title
		}

		switch(this.template)
		{
			case 'menu':
				this.items.forEach(item => {
					this.querySelector('.dropdown__list').appendChild(this.drawElement('li', {}, [
						this.drawElement('a', { href: item.link }, [String(item.label)])
					]))
				})
				break

			case 'field':
				this.items.forEach((item, i) => {
					this.querySelector('.dropdown__list').appendChild(
						this.drawElement('li', { 'data-value': item.value }, [String(item.label)])
					)
					this.querySelector('.dropdown__select').appendChild(
						this.drawElement('option', { value: item.value }, [String(item.label)])
					)
					if (i == 0) this.querySelector('.dropdown__input').value = item.label
				})
				break

			case 'wrapper':
				this.querySelector('.dropdown__content').innerHTML = this.baseHTML
				break
		}

		return true
	}

	async behavior()
	{
		this.querySelector('.dropdown__header').addEventListener('click', e => this.switchActive())

		switch(this.template)
		{
			case 'menu':
				this.addEventListener('mouseleave', e => this.active = false)
				break

			case 'field':
				this.addEventListener('mouseleave', e => this.active = false)
					this.querySelectorAll('.dropdown__list > li').forEach(item => {
					item.addEventListener('click', e => {
						this.querySelector('.dropdown__header > input').value = item.textContent
						this.switchActive(item.getAttribute('data-value'))
					})
				})
				break
		}

		return true
	}

	switchActive(value = false)
	{
		this.active = !this.active
			
		if (value && this.template === 'field') {
			this.querySelectorAll('select > option').forEach(o => o.removeAttribute('selected'))
			this.querySelector(`select > option[value="${value}"]`).setAttribute('selected', '')
		}

		const icon = this.querySelector('.dropdown__icon')
		icon.replaceChild(this.createIcon(), icon.firstChild)
	}

	createIcon()
	{
		this.icons = { active: this.icon, inactive: this.icon }

		if (this.icon.includes('|')) {
			const [ active, inactive ] = this.icon.split('|')
			this.icons = { active: active, inactive: inactive }
		}

		return this.active ? this.drawFaIcon(this.icons.active) : this.drawFaIcon(this.icons.inactive)
	}
}