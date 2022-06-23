import {VApp, VBtn, VDatePicker, VForm, VMenu, VTextField, VIcon} from "vuetify/lib/components";

import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {
    DatePicker,
    FormVue,
    HiddenfieldHoneypot,
    OnTextfieldEmail,
    OnTextfieldNumber,
    OnTextfieldText
} from "../../main";
import Vuex from "vuex";
import Submit_button from "../../components/misc/submit_button";

Vue.use(Vuex);
Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-text-field', VTextField)
Vue.component('v-btn', VBtn);
Vue.component('v-date-picker', VDatePicker);
Vue.component('v-form', VForm);
Vue.component('v-app', VApp);
Vue.component('v-icon', VIcon);

export default {
    title: 'Formvue/Forms/Simple',
    component: FormVue,
};

const formSchema = {};
formSchema['configuration'] = {"id":"test-764","identifier":"test","api":{"status":null,"errors":null,"callbacks":[],"preprocess":[],"actionAfterSuccess":null,"page":{"current":1,"nextPage":null,"pages":1,"labels":{"nextButtonLabel":"Submit"},"errorHint":"Please check %s (0|field|fields)","pageSummaryText":null,"submitButtonAlignment":"left","label":"Step"},"pageDefinitions":[{"index":0,"identifier":"page-1","label":"Step"}]},"global":{"labels":{"error":"An error occured, please contact the provider"}},"action":"\/test-form\/send\/#test-764","i18n":"de-DE","elements":[{"defaultValue":"","type":"Text","identifier":"my-text","label":"Text","properties":{"fluidAdditionalAttributes":{"required":"required"},"validationErrorMessages":[{"code":1221560910,"message":"Please fill in this field"},{"code":1221560718,"message":"Please fill in this field"},{"code":1347992400,"message":"Please fill in this field"},{"code":1347992453,"message":"Please fill in this field"}]},"renderingOptions":[],"validators":[{"identifier":"NotEmpty","code":1221560910,"errorMessage":"Please fill in this field"}],"name":"tx_form_formframework[test-764][my-text]"},{"defaultValue":"","properties":{"fluidAdditionalAttributes":{"step":"2","required":"required"},"validationErrorMessages":[{"code":1221560910,"message":"Please insert a number"},{"code":1221560718,"message":"Please insert a number"},{"code":1347992400,"message":"Please insert a number"},{"code":1347992453,"message":"Please insert a number"}]},"type":"Number","identifier":"my-number","label":"Number","renderingOptions":[],"validators":[{"identifier":"Number","code":1221563685,"errorMessage":"Sie m\u00fcssen eine g\u00fcltige Zahl eingeben."},{"identifier":"NotEmpty","code":1221560910,"errorMessage":"Please insert a number"}],"name":"tx_form_formframework[test-764][my-number]"},{"defaultValue":"","type":"Email","identifier":"my-email","label":"Email address","renderingOptions":[],"validators":[{"identifier":"EmailAddress","code":1221559976,"errorMessage":"Sie m\u00fcssen eine g\u00fcltige Email-Adresse angeben."}],"properties":[],"name":"tx_form_formframework[test-764][my-email]"},{"properties":{"containerClassAttribute":"input","elementClassAttribute":"","elementErrorClassAttribute":"error","renderAsHiddenField":false,"styleAttribute":"position:absolute; margin:0 0 0 -999em;"},"type":"Honeypot","identifier":"vZQhng3wTCudYfPVOzR4","label":"","name":"tx_form_formframework[test-764][vZQhng3wTCudYfPVOzR4]"},{"properties":[],"type":"Hidden","identifier":"__currentPage","defaultValue":1,"label":"","name":"tx_form_formframework[test-764][__currentPage]"},{"properties":[],"type":"Hidden","identifier":"__trustedProperties","defaultValue":"{\"test-764\":{\"my-text\":1,\"my-number\":1,\"my-email\":1,\"vZQhng3wTCudYfPVOzR4\":1,\"__currentPage\":1}}b56ddc159046512823ae0d1ec478eeb67d8da6ff","label":"","name":"tx_form_formframework[test-764][__trustedProperties]"},{"properties":[],"type":"Hidden","identifier":"__state","defaultValue":"TzozOToiVFlQTzNcQ01TXEZvcm1cRG9tYWluXFJ1bnRpbWVcRm9ybVN0YXRlIjoyOntzOjI1OiIAKgBsYXN0RGlzcGxheWVkUGFnZUluZGV4IjtpOjA7czoxMzoiACoAZm9ybVZhbHVlcyI7YTowOnt9fQ==c11b13e3afc0b185933c72ed0a65103c6a2b6b43","label":"","name":"tx_form_formframework[test-764][__state]"}]};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {FormVue: FormVue},
    template: '<form-vue v-bind="$props" />'
});

export const Default = Template.bind({});
Default.args = {
    formSchema,
    componentsMap: {
        Text: OnTextfieldText,
        Email: OnTextfieldEmail,
        Number: OnTextfieldNumber,
        DatePicker: DatePicker,
        Honeypot: HiddenfieldHoneypot,
        OnSubmitButton: Submit_button
    },
    fieldPropsOverwrite: {
        filled: true // force all vuetify inputs to be variant=filled
    },
};
Default.storyName = 'Simple'
