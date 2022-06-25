'use strict'

import "@fortawesome/fontawesome-free/js/all.js";
import "@fortawesome/fontawesome-free/css/all.css";

import './demo.css'

import Dropdown from './Dropdown/Dropdown.js'
import Tabs from './Tabs/Tabs.js'

export default ( _ => { 

	window.addEventListener("DOMContentLoaded", _ => {

		console.log(Jellycat)

		Jellycat.options({
			debug: true
		})

		Dropdown.define('Dropdown/Dropdown.html')
		Tabs.define('Tabs/Tabs.html')

	})

})()