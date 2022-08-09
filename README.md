# Jellycat Component

## Installation
```console
user@121: ~$ npm i -S jellycat-component
```

## Getting started

Sample.js
```js
import { JcComponent } from 'jellycat-component'

export default class Sample extends JcComponent
{
  constructor() { super() }

  init()
  {
    // code here..
  }

  render()
  {
    // code here..
  }

  behavior()
  {
    // code here..
  }

}
````

index.js
```js
import Sample from './Sample.js'
// ...
Dropdown.define()
````

## API References

### component
-JcComponent
-JcDivComponent
-JcSpanComponent
-JcUlComponent
-JcLiComponent
-JcPComponent
-JcLabelComponent
-JcInputComponent
-JcTextareaComponent
-Static method define()

### lifecycle
-Method init()
-Method render()
-Method behavior()
-Method currentLifeCycleIndex()

### templating:
-template
-draw
-drawElement

### providing:
-loading
-fetchData

### options:
-options

### Mycelaneous:
-methods
-drawFaIcon
