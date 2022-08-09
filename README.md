# Jellycat Component

## Installation
```console
$ npm i -S jellycat-component
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
Sample.define()
````

index.html
```html
<jc-sample></jc-sample>
````

## Extends from HTML ancestors

If you prefere keep html default tagname, Jellycat Component let you use the "##is##" attribute.
HTML tagnames supported are : div, span, ul, li, p, label, input, textarea.
to use this feature yo have to extend your component from one of this class in place of JcComponent :

- JcDivComponent
- JcSpanComponent
- JcUlComponent
- JcLiComponent
- JcPComponent
- JcLabelComponent
- JcInputComponent
- JcTextareaComponent

Example to use div tagname :

```js
// This is an 
import { JcDivComponent } from 'jellycat-component'
export default class Sample extends JcComponent { ... }
````
```html
<div is="jc-sample"></div>
````

## Lifecycle

Jellycat components have lifecycle, start to `down` and go to `up`, each state perform different actions. You have to use this three lifecycle to develop your component : `init`, `render`, `behavior`. refere to API References - lifecycle to have more informations about each lifecycle.

```mermaid
graph LR
down0(["DOWN"])
init1["INIT"]
render2["RENDER"]
behavior3["BEHAVIOR"]
up4(["UP"])
down0-->init1
init1-->render2
render2-->behavior3
behavior3-->up4
```


## API References

### component
- JcComponent
- JcDivComponent
- JcSpanComponent
- JcUlComponent
- JcLiComponent
- JcPComponent
- JcLabelComponent
- JcInputComponent
- JcTextareaComponent
- Static method define()

### lifecycle

- Async method init()
- Async method render()
- Async method behavior()
- Method currentLifeCycleIndex()

### templating:
- Property template
- Method draw
- Method drawElement

### providing:
- Property loading
- Async method fetchData

### options:
- Property options

### Mycelaneous:
- Method methods
- Method drawFaIcon
