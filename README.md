
```console
foo@bar:~$ npm i -S jellycat-component
```

```js
// Sample.js
import { JcComponent } from 'jellycat-component'

export default class Sample extends JcComponent
{
	constructor() { super() }
}
````

```js
// index.js
import Sample from './Sample.js'
// ...
Dropdown.define()

````

component :
JcComponent
JcDivComponent
JcSpanComponent
JcUlComponent
JcLiComponent
JcPComponent
JcLabelComponent
JcInputComponent
JcTextareaComponent
Static method define()

lifecycle:
Method init()
Method render()
Method behavior()
Method currentLifeCycleIndex()

templating:
template
draw
drawElement

providing:
loading
fetchData

options:
options

Mycelaneous:
methods
drawFaIcon
