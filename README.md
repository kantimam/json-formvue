# Formvue Json

Formvue is a Vue 2.x component library that generates dynamic forms from a provided JSON schema.
It is tailored to be used with another Typo3 library "[Extended Form Framework](https://git.ondigo.io/proj-typo3/extended_form_framework)" but you can easily translate any configuration to the required format.

# Setup

- preferably install [Typo3](https://get.typo3.org/) and [Extended Form Framework](https://git.ondigo.io/proj-typo3/extended_form_framework) before.
- prepare your front end to be able to use es6 features and Vue. You can use [webpack](https://webpack.js.org/) for that.
- make sure you are using Node version >= 12.18.3 (check out [nvm](https://github.com/nvm-sh/nvm) for using a certain Node version).
- install the newest version of formvue-json via npm.
- register the custom registry url for @ondigo-internal npm packages (see `.npmrc`)

Install command while this repository is private

```
npm i git+https://formvue-json:yb77VU1nUyPe9Sx5FpDo@git.ondigo.io/proj-typo3/formvue-json.git#1.8.2
```

Most noteably this will install Vue version 2.6.11, Vuetify 2.4.0 and Vuex 3.4.0  
Already having different versions of these libraries in your project could lead to problems.   
If you already use Vuex you need to look into merging your store with formvues store yourself.

# Configuration

## Here is a minimal configuration to get you up and running.

```js
import {
	FormVue, // required
	createStore, // required
	OnTextfieldText, // optional field for testing
} from 'formvue-json'; 

import Vue from 'vue';
import Vuex from 'vuex';
import Vuetify from 'vuetify/lib/framework';

// configure Vue with all the features you want to use
// Vuex and Vuetify are required (make sure you only configure these once)
Vue.use(Vuex);
Vue.use(Vuetify);

// grab an element you want to mount Vue into
const formVueWrapper=document.querySelector('.form-vue-wrapper');

// grab your form configuration.
// In this case we stored it on the window object
const formVueConfig=window.extendedforms['form-vue-form']; 
// extended is an object that can contain multiple forms. We take the one with the key form-vue-form


// create an instance of Vue and use it to render the Vue component FormVue.
// Then mount the instance into your wrapper in this case formVueWrapper

new Vue({
	vuetify: new Vuetify({}),  // configure Vuetify to match your theme needs
	store: createStore(Vuex, { // create a pre filled Vuex store
		formData: formSchema, // this is the important part
		callbacksMap: {} // this is optional and will be explained later
	}),
	render: h => h(FormVue, {
		props: {
			formSchema,
			componentsMap: { // register the components you want to use here
				Text: OnTextfieldText,
			},
			fieldPropsOverwrite: {
				filled: true // force all vuetify inputs to be variant=filled
			}
		}
	})
}).$mount(formVueWrapper);


```

## Here is a typical configuration for Typo3 projects.

```js 

import {
	FormVue,
	createStore,
	OnTextfieldText,
	OnTextfieldEmail,
	OnTextfieldNumber,
	HiddenfieldHoneypot,
	OnCheckBox,
	OnSelect,
	FileUpload,
	StaticText,
	OnCaptcha,
	OnTextArea,
	Telephone
} from 'formvue-json';

import Vue from 'vue';
import Vuex from 'vuex';
import Vuetify from 'vuetify/lib/framework';

// configure Vue
Vue.use(Vuex);
Vue.use(Vuetify);


/*
    In this case we want to initialize all the forms of the current page at once
*/
export default function initFormVue() {
	const forms = document.querySelectorAll('[data-id]');  // select all the DOM Nodes that are supposed to contain a form later
	const formConfigsMap = window.extendedforms; // get the configuration for all the pages forms. It is an object / dictionary [formId]: formConfig

	if (!formConfigsMap) return; // if the page did not contain a form configuration return early

	// create your vuetify theme once
	const theme = {
		primary: '#637785',
		error: '#e4052f',
	};
	const vuetifyConfig = {
		theme: {
			dark: false,
			themes: {
				light: theme,
				dark: theme
			}
		}
	};

    // optional!
	const callbacksMap={ // a dictionary of callbacks that can be fired after finishing a form step or the entire form
		GoogleAnalytics: async(cbArgs)=>{
			if (typeof gtag === 'function') {
				const {eventAction="Rückruf", eventCategory="Rückruf beantragen", eventLabel="Overlay"}=cbArgs;
				return gtag('event', eventAction, {'event_category': eventCategory, 'event_label': eventLabel});
			}
		}
	}

    // optional!
	function scrollToError(inputWithError) {
		if (inputWithError) {
			let scrollTarget = inputWithError.getBoundingClientRect().top + window.scrollY;
			const offset = 100;
			scrollTarget -= offset;
			scrollTarget = scrollTarget > 0 ? scrollTarget : 0;
			window.scrollTo({
				top: scrollTarget,
				behavior: 'smooth'
			});
		}
	}

    // iterate over all DOM Nodes that are supposed to be forms and try creating a form for them
	for (let form of forms) {
        // in this case we store the id of the form configuration inside the data-id propery of each DOM Node
		const id = form.getAttribute('data-id');

		if (!id) continue;
		const formSchema = formConfigsMap[id]; // try finding the form configuration with the specified id inside the formConfigsMap
		if (!formSchema || !formSchema.configuration) continue; // if we dont find a valid configuration object skip this form


		new Vue({
			vuetify: new Vuetify(vuetifyConfig),
			store: createStore(Vuex, {
				formData: formSchema,
				callbacksMap: callbacksMap
			}),
			render: h => h(FormVue, {
				props: {
					formSchema,
					componentsMap: {
						Text: OnTextfieldText,
						Email: OnTextfieldEmail,
						Number: OnTextfieldNumber,
						Honeypot: HiddenfieldHoneypot,
						Checkbox: OnCheckBox,
						LinkedCheckbox: OnCheckBox,
						SingleSelect: OnSelect,
						FileUpload: FileUpload,
						StaticText: StaticText,
						Textarea: OnTextArea,
						Oncaptcha: OnCaptcha,
						Telephone: Telephone
					},
					fieldPropsOverwrite: {
						filled: true // force all vuetify inputs to be variant=filled
					},
					scrollToErrorCallback: scrollToError // add a function that gets called when the form error summary is clicked
				}
			})
		}).$mount(form);


	}
}


```

# API

## FormVue

### Properties

| name | type | required | default |
| ------ | ------ | ------ | ------ |
| formSchema | FormSchema | true |  |
| componentsMap | ComponentsMap | true | {} |
| appName | String | false | tx_form_formframework |
| fieldPropsOverwrite | Vue Component Props | false | {} |
| scrollToErrorCallback | ScrollToErrorCallback | false | noOp=()=>{} |

### Types

#### FormSchema
contains the entire configuration for the current form but for now we only care about the key elements
```typescript
interface FormSchema {
	...
	elemenents: ElementDefinition[];
	...
}

type ElementDefinition=InputElementDefinition | ContainerElementDefinition | ContentElementDefinition; 
```


#### ComponentsMap
```typescript
interface ComponentsMap {
	[elementIdentifier: string]: VueComponent
}
```

#### ScrollToErrorCallback
```typescript
function scrollToErrorCallback(firstInputWithError: HTMLElement){
	// use the provided HTMLElement to lead the user to the first error.
	// you focus it, scroll it into view, make it blink or implement your own idea
}
```

## Vuex
to be implemented

## Utility functions
you can find useful utilty functions inside the lib folder formvue-json/src/lib/util.js  
Some of these functions will be re exported from the library root but otherwise you can grab them from src.  

### Important utility functions

### createInputRules
takes the validators found in the InputElementDefinition and generates an array of [VuetifyValidationRules](https://vuetifyjs.com/en/components/forms/#rules).
```typescript
const createInputRules = (required: boolean, validators: ElementValidators, context: ElementProperties): VuetifyValidationRules => {
	const rules = createValidatorsMap(validators, context);
	if (!!required) rules.require = (v) => !!v
	const rulesArray = [];
	for (const key in rules) rulesArray.push(rules[key])
	return rulesArray;
}


```

### createRequiredLabel
```typescript
implement
```

#### isRequired
```typescript
implement
```

#### getPlaceholder
```typescript
implement
```

# Extend - Create your own elements
TODO
