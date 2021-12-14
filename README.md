# Formvue Json

Formvue is a Vue 2.x component library that generates dynamic forms from a provided JSON schema.
It is tailored to be used with another Typo3 library "extended formframework" but you can easily translate any configuration to the required format.

# Setup

- Preferably install Typo3 and Extended Form Framework before.
- Prepare your front end to be able to use es6 features and Vue. You can use webpack for that.
- Make sure you are using Node version >= 12.18.3 (check out nvm for using a certain Node version).
- Install the newest version of formvue-json via npm.

Install command while this repository is private

```
npm i git+https://formvue-json:yb77VU1nUyPe9Sx5FpDo@git.ondigo.io/proj-typo3/formvue-json.git#1.5.3
```

Most noteably this will install Vue version 2.6.11, Vuetify 2.4.0 and Vuex 3.4.0  
Already having different versions of these libraries in your project could lead to problems.   
If you already use Vuex you need to look into merging your store with formvues store yourself.

# Configure

Here is a minimal configuration to get you up and running.

```
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
