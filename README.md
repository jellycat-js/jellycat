[![🚀 build, test and publish](https://github.com/jellycat-js/jellycat/actions/workflows/publish.yml/badge.svg?branch=master)](https://github.com/jellycat-js/jellycat/actions/workflows/publish.yml)
[![License](https://img.shields.io/npm/l/express.svg)](https://github.com/arminbro/generate-react-cli/blob/master/LICENSE)

# Jellycat Component

## Installation
```console
$ npm i -S jellycat-js/jellycat
```

## Getting started

Minimal naked component look like this :

> Sample.js
```js
import { JcComponent } from '@jellycat-js/jellycat'

export default class Sample extends JcComponent
{
  constructor() { super() }

  async init()
  {
    // code here..

    return true
  }

  async render()
  {
    // code here..

    return true
  }

  async behavior()
  {
    // code here..

    return true
  }

}
```

> index.html
```html
<jc-sample></jc-sample>

<script type="text/javascript">
  import Sample from './Sample.js'
  Sample.define()
</script>
```

## Extends from HTML ancestors

If you prefere keep html default tagname, Jellycat Component let you use the "**is**" attribute.\
HTML tagnames supported are : `div`, `span`, `ul`, `li`, `p`, `label`, `input`, `textarea`.\
to use this feature yo have to extend your component from one of this class in place of JcComponent :

- JcDivComponent
- JcSpanComponent
- JcUlComponent
- JcLiComponent
- JcPComponent
- JcLabelComponent
- JcInputComponent
- JcTextareaComponent

### Example

> Sample.js
```js
import { JcDivComponent } from 'jellycat-component'
export default class Sample extends JcDivComponent { ... }
````

> index.html
```html
<div is="jc-sample"></div>

<script type="text/javascript">
  import Sample from './Sample.js'
  Sample.define()
</script>
````

## Lifecycle

Jellycat components have lifecycle, start to `down` and go to `up`, each state perform different actions.\
You have to use this three lifecycle to develop your component : `init`, `render`, `behavior`.\
Refere to API References - lifecycle to have more informations about each lifecycle.

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

## Templating

Jellycat Component come with template engine that you can use to manage html of your component.\
Make and html file with some template inside :

> Sample.html
```html
<template id="root">
  <div class="container"></div>
</template>

<template id="custom">
  <p>Hello World !</p>
</template>
````

This file need to be expose on web and accesable from a static url like assets,\
see more information in API - Reference - Integration.\
You can attach this file to your component like that :

> index.html
```html
<jc-sample></js-sample>

<script type="text/javascript">
  import Sample from './Sample.js'
  Sample.define('templates/Sample.html')
</script>
````

By default the template with id "**root**" will be use as root html for your component but if your prefere set custom id you can use "*template*" attribute on component to specify id manualely.

> index.html
```html
<jc-sample template="custom"></js-sample>
````

All templates element in file will be passed to define method will be accesable with drawTemplate method since the render lyfecycle of the component.

> Sample.js
```js
export default class Sample extends JcComponent
{
  render()
  {
    let template = this.drawTemplate('custom')
    this.querySelector('.container').appendChild(template)
  }
}
````

## Providing data

Jellycat Component can perform HTTP request to load data or use some api or backend

> Sample.js
```js
export default class Sample extends JcComponent
{
  init()
  {
    let data = this.fetchData('GET', url)
  }
}
````

## Jellycat Options

Jellycat Options can be used on 3 level of effect, if you defined option on instance of component, it was scoped to component, if you define on component is scope tout all instance of this component and if you define on Jellycat global var it will be apply to all of component.

available options :

| option         | type      | default | description                                       |
|:---------------|:---------:|:-------:|:--------------------------------------------------|
| **debug**      | *boolean* | false   | use to get debug info in browser console          |
| **prefix**     | *string*  | 'jc'    | determine the first part of tag of your component |
| **autoRender** | *string*  | 'root'  | determine the default root template name          |

> index.html
```html
<jc-sample></js-sample>

<script type="text/javascript">
  import Sample from './Sample.js'
  Jellycat.options({ debug: true })
  Sample.define('templates/Sample.html')
</script>
````

> index.html
```html
<jc-sample></js-sample>

<script type="text/javascript">
  import Sample from './Sample.js'
  Sample.define('templates/Sample.html', { debug: true })
</script>
````

> index.html
```html
<jc-sample options="<!-- optionsJson -->"></js-sample>
````

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
