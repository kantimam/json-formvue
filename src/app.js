import 'core-js/stable';
import 'regenerator-runtime/runtime';

import Vue from 'vue';
import createStore from './store/index.js'
import globalInputRenderer from './components/field_renderer'
import ComponentsMapping from './lib/ComponentsMapping';
import Vuetify from 'vuetify/lib/framework';



import App from './App.vue';
import DefaultComponents from './lib/DefaultComponents';
import DefaultCallbacks from './lib/DefaultCallbacks';
import DefaultValidators from './lib/DefaultValidators';


export class DynamicJsonForm{
    formViews={};
    appName='tx_form_formframework';
    componentsDictionary=DefaultComponents;
    validatorsDictionary=DefaultCallbacks;
    callbacksDictionary=DefaultValidators;
    vuetifyConfig={
        icons: {
            iconfont: 'mdi'
        }
    }
    vuetifyContext;


    constructor(formConfigsList, formElementsList, config){
        if(!formConfigsList) throw new Error('an object with form configurations needs to be provided');
        if(!formElementsList || !formElementsList.length) throw new Error('a list of dom nodes needs to be provided');

        this.formConfigsList=formConfigsList;
        this.formElementsList=formElementsList;

        if(config){
            if(config.appName) this.appName=config.appName;
            if(config.components) this.componentsDictionary=new ComponentsMapping(config.components);
            if(config.validators) this.validatorsDictionary=new ComponentsMapping(config.validators);
            if(config.callbacks) this.callbacksDictionary=new ComponentsMapping(config.callbacks);
            if(config.customLoadingComponent) this.customLoadingComponent=config.loadingComponent;
            if(config.customButtonComponent) this.customButtonComponent=config.buttonComponent;
            if(config.vuetifyConfig) this.vuetifyConfig=config.vuetifyConfig;
        }


    }

    init(){
        // init vuetify and use custom config if provided
        Vue.use(Vuetify);
        this.vuetifyContext=new Vuetify(this.vuetifyConfig)

        Vue.config.productionTip = false;
        Vue.component('field-renderer', globalInputRenderer);

        // init global components and overwrite them if custom components are provided
        if(this.customLoadingComponent){
            Vue.component('o-loading', this.customLoadingComponent)
        }else {
            const loading=()=>import('vuetify/lib/components/VProgressCircular');
            Vue.component('o-loading', loading);
        }
        if(this.customButtonComponent){
            Vue.component('o-btn', this.customButtonComponent)
        }else {
            const loading=()=>import('vuetify/lib/components/VBtn');
            Vue.component('o-btn', loading);
        }

        Vue.prototype.$componentsDictionary=this.componentsDictionary;
        Vue.prototype.$validatorsDictionary=this.validatorsDictionary;
        Vue.prototype.$callbacksDictionary=this.callbacksDictionary;
        Vue.prototype.$appName = this.appName;

        for(let form of this.formElementsList) {
            const id = form.getAttribute('data-id');
            const wrapper = document.querySelector('[data-id="' + id + '"]');

            if(!wrapper){
                console.log(`could not find wrapper with data-id ${id}`);
                continue;
            }
            const formData=this.formConfigsList[id];
            if(!formData || !formData.configuration){
                console.log(`could not find form with the id ${id}`);
                continue;
            }

            const vueInstance=new Vue({
                vuetify: this.vuetifyContext,
                store: createStore(formData),
                render: h => h(App)
            }).$mount(wrapper);

            this.formViews[id]=vueInstance;
        }
    }

}

const forms = document.querySelectorAll('[data-id]');
const formConfigsList=window.extendedforms;
if(formConfigsList){
    const ondigoForms=new DynamicJsonForm(formConfigsList, forms);
    ondigoForms.init();
}


export default DynamicJsonForm;
