<template>
  <v-app :class="`ondigo-formvue-app formvue-${formSchema.configuration.identifier}`" :id="`formvue-${formSchema.configuration.id}`">
    <div class="ondigo-formvue">
      <div class="ondigo-form-wrapper" v-if="!formFinished">
        <single-step-form v-if="isSingleStepForm" />
        <multi-step-form v-else />
      </div>

      <component
          v-if="this.mixedComponents['FormResponse']"
          :is="this.mixedComponents['FormResponse']"
          :formName="formSchema.configuration.id"
          :response="formResponse"
      />
      <!-- Fallback response -->
      <div
          v-else-if="formResponse"
          v-html="formResponse"
      />
    </div>
  </v-app>
</template>

<script>
import MultiStepForm from "./components/multi_step_form.vue";
import SingleStepForm from "./components/single_step_form.vue";

import SubmitButton from "./components/misc/submit_button.vue";
import FormResponse from './components/misc/form_response/form_response.vue';

export default {
  components: {
    SingleStepForm,
    MultiStepForm,
  },
  props: {
    appName: {
      type: String,
      default: "tx_form_formframework",
    },
    componentsMap: {
      type: Object,
      default: function () {
        return {};
      },
    },
    callbacksMap: {
      type: Object,
      default: function () {
        return {};
      },
    },
    fieldPropsOverwrite: {
      type: Object,
      required: false,
      default: function () {
        return {};
      },
    },
    formSchema: {
      type: Array,
      required: true,
    },
    validatorsMap: {
      type: Object,
      default: function () {
        return {
          filled: true,
        };
      },
    },
    scrollToErrorCallback: {
      type: Function,
      default: function () {
        return (element) => {
          return;
        };
      },
    },
  },
  provide() {
    return {
      appName: this.appName,
      componentsMap: Object.freeze(this.mixedComponents),
      formSchema: Object.freeze(this.formSchema),
      scrollToErrorCallback: this.scrollToErrorCallback,
      fieldPropsOverwrite: this.fieldPropsOverwrite,
    };
  },
  computed: {
    formFinished() {
      return this.$store.state.formFinished;
    },
    formResponse() {
      return this.$store.state.formResponse;
    },
    isSingleStepForm() {
      return this.$store.getters.getIsSingleStep;
    },
    mixedComponents() {
      const components = {...this.componentsMap};
      const mixin = (name, component) => {
        if (!(name in components))
          components[name] = component;
      };

      // mixin default form components, such as submit button (add lazy import?)
      mixin('SubmitButton', SubmitButton);
      mixin('FormResponse', FormResponse);

      return components;
    }
  }
};
</script>

