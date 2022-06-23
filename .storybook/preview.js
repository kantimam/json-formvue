import Vue from "vue";
import Vuex from 'vuex';
import Vuetify from 'vuetify/lib/framework';

import createStore from "@/store/index.ts";
import {VApp} from "vuetify/lib/components";

Vue.use(Vuex);
Vue.use(Vuetify);

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

const formDefinitionExample = {"id":"test-764","identifier":"test","api":{"status":null,"errors":null,"callbacks":[],"preprocess":[],"actionAfterSuccess":null,"page":{"current":1,"nextPage":null,"pages":1,"labels":{"nextButtonLabel":"Submit"},"errorHint":"Please check %s (0|field|fields)","pageSummaryText":null,"submitButtonAlignment":"left","label":"Step"},"pageDefinitions":[{"index":0,"identifier":"page-1","label":"Step"}]},"global":{"labels":{"error":"An error occured, please contact the provider"}},"action":"\/test-form\/send\/#test-764","i18n":"de-DE","elements":[{"defaultValue":"","type":"Text","identifier":"my-text","label":"Text","properties":{"fluidAdditionalAttributes":{"required":"required"},"validationErrorMessages":[{"code":1221560910,"message":"Please fill in this field"},{"code":1221560718,"message":"Please fill in this field"},{"code":1347992400,"message":"Please fill in this field"},{"code":1347992453,"message":"Please fill in this field"}]},"renderingOptions":[],"validators":[{"identifier":"NotEmpty","code":1221560910,"errorMessage":"Please fill in this field"}],"name":"tx_form_formframework[test-764][my-text]"},{"defaultValue":"","properties":{"fluidAdditionalAttributes":{"step":"2","required":"required"},"validationErrorMessages":[{"code":1221560910,"message":"Please insert a number"},{"code":1221560718,"message":"Please insert a number"},{"code":1347992400,"message":"Please insert a number"},{"code":1347992453,"message":"Please insert a number"}]},"type":"Number","identifier":"my-number","label":"Number","renderingOptions":[],"validators":[{"identifier":"Number","code":1221563685,"errorMessage":"Sie m\u00fcssen eine g\u00fcltige Zahl eingeben."},{"identifier":"NotEmpty","code":1221560910,"errorMessage":"Please insert a number"}],"name":"tx_form_formframework[test-764][my-number]"},{"defaultValue":"","type":"Email","identifier":"my-email","label":"Email address","renderingOptions":[],"validators":[{"identifier":"EmailAddress","code":1221559976,"errorMessage":"Sie m\u00fcssen eine g\u00fcltige Email-Adresse angeben."}],"properties":[],"name":"tx_form_formframework[test-764][my-email]"},{"properties":{"dateFormat":"d.m.Y","enableMask":true,"placeholder":"_","minDate":"","maxDate":"","fluidAdditionalAttributes":{"required":"required","minDate":"","maxDate":"today-18y"},"validationErrorMessages":[{"code":1221560910,"message":"Bitte ausf\u00fcllen"},{"code":1221560718,"message":"Bitte ausf\u00fcllen"},{"code":1347992400,"message":"Bitte ausf\u00fcllen"},{"code":1347992453,"message":"Bitte ausf\u00fcllen"},{"code":1638626122,"message":"Sie m\u00fcssen mindestens 18 Jahre alt sein"},{"code":1638624830,"message":"Sie m\u00fcssen mindestens 18 Jahre alt sein"},{"code":1638624938,"message":"Sie m\u00fcssen mindestens 18 Jahre alt sein"}]},"validators":[{"identifier":"MaskComplete","code":1636731552,"errorMessage":"Bitte vervollst\u00e4ndigen Sie Ihre Eingabe"},{"identifier":"NotEmpty","code":1221560910,"errorMessage":"Bitte ausf\u00fcllen"},{"options":{"minDate":"","maxDate":"today-18y"},"identifier":"DateInterval","code":1638626122,"errorMessage":"Sie m\u00fcssen mindestens 18 Jahre alt sein"}],"type":"DatePicker","identifier":"my-date","label":"Date Picker","renderingOptions":[],"name":"tx_form_formframework[test-764][my-date]"},{"properties":{"containerClassAttribute":"input","elementClassAttribute":"","elementErrorClassAttribute":"error","renderAsHiddenField":false,"styleAttribute":"position:absolute; margin:0 0 0 -999em;"},"type":"Honeypot","identifier":"YF4Xd","label":"","name":"tx_form_formframework[test-764][YF4Xd]"},{"properties":[],"type":"Hidden","identifier":"__currentPage","defaultValue":1,"label":"","name":"tx_form_formframework[test-764][__currentPage]"},{"properties":[],"type":"Hidden","identifier":"__trustedProperties","defaultValue":"{\"test-764\":{\"my-text\":1,\"my-number\":1,\"my-email\":1,\"my-date\":1,\"YF4Xd\":1,\"__currentPage\":1}}10d7c6a4d270e3a7ec5f6a37da2736c467a63c5b","label":"","name":"tx_form_formframework[test-764][__trustedProperties]"},{"properties":[],"type":"Hidden","identifier":"__state","defaultValue":"TzozOToiVFlQTzNcQ01TXEZvcm1cRG9tYWluXFJ1bnRpbWVcRm9ybVN0YXRlIjoyOntzOjI1OiIAKgBsYXN0RGlzcGxheWVkUGFnZUluZGV4IjtpOjA7czoxMzoiACoAZm9ybVZhbHVlcyI7YTowOnt9fQ==c11b13e3afc0b185933c72ed0a65103c6a2b6b43","label":"","name":"tx_form_formframework[test-764][__state]"}]};

export const decorators = [
  (story, context) => {
    const wrapped = story(context)

    return Vue.extend({
      vuetify: new Vuetify({}),
      store: createStore(Vuex, {
        formData: {configuration: formDefinitionExample},
        callbacksMap: {}
      }),
      components: { wrapped, VApp },
      template: `<v-app><wrapped /></v-app>`
    })
  },
]
