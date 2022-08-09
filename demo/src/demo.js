'use strict'

import '@fortawesome/fontawesome-free/js/all.js'
import '@fortawesome/fontawesome-free/css/all.css'

import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

import Dropdown from './Dropdown/Dropdown.js'
import Tabs from './Tabs/Tabs.js'

import './demo.css'
import data from './demo.json'

export default ( _ => { 

	window.addEventListener('DOMContentLoaded', _ => {

		document.querySelectorAll('jc-dropdown[template="field"]').forEach(dropdown => {
			dropdown.setAttribute('items', encodeURI(JSON.stringify(data.items_field)))
		})

		document.querySelectorAll('jc-dropdown[template="menu"]').forEach(dropdown => {
			dropdown.setAttribute('items', encodeURI(JSON.stringify(data.items_menu)))
		})

		// console.log(Jellycat)

		Jellycat.options({
			debug: true
		})

		Dropdown.define('Dropdown/Dropdown.html')
		Tabs.define('Tabs/Tabs.html')

		// hljs.highlightAll();

		console.log(Jellycat)
		// console.log(Jellycat.methods)
		
	})

})()