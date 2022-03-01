<template>
  <v-app :class="`ondigo-formvue-app formvue-${formSchema.configuration.identifier}`"
         :id="`formvue-${formSchema.configuration.id}`">
    <div :class="`ondigo-formvue ${formFinished? 'finished' : ''}`">
      <div class="ondigo-form-wrapper" v-if="!formFinished">
        <template v-if="isSingleStepForm">
          <component :is="singleStepForm">
            <template v-if="showErrorResponseInsideForm" slot="append-inner">
              <div class="response-wrapper" ref="formResponseElement">
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
            </template>
          </component>
        </template>
        <template v-else>
          <component :is="multiStepForm" />
        </template>
      </div>
      <div v-if="!showErrorResponseInsideForm || formFinished" class="response-wrapper" ref="formResponseElement">
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
    </div>
  </v-app>
</template>

<script>
import DefaultMultiStepForm from "./components/multi_step_form.vue";
import DefaultSingleStepForm from "./components/single_step_form.vue";

import SubmitButton from "./components/misc/submit_button.vue";
import FormResponse from './components/misc/form_response/form_response.vue';

export default {
  components: {
    DefaultSingleStepForm,
    DefaultMultiStepForm,
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
    scrollIntoView: {
      type: Function,
      default: function () {
        return (element) => {
          return;
        };
      },
    },
    scrollToSuccessMessage: {
      type: Boolean,
      default: false
    },
    customSingleStepForm: {
      type: Object,
      required: false
    },
    customMultiStepForm: {
      type: Object,
      required: false
    },
    showErrorResponseInsideForm: {
      type: Boolean,
      default: false
    }

  },
  provide() {
    return {
      appName: this.appName,
      componentsMap: Object.freeze(this.mixedComponents),
      formSchema: Object.freeze(this.formSchema),
      scrollIntoView: this.scrollIntoView,
      fieldPropsOverwrite: this.fieldPropsOverwrite,
    };
  },
  computed: {
    singleStepForm(){
      return this.customSingleStepForm || DefaultSingleStepForm;
    },
    multiStepForm(){
      return this.customMultiStepForm || DefaultMultiStepForm;
    },
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
  },
  watch: {
    formFinished: function (val) {
      this.$nextTick(() => {
        if (val && this.scrollToSuccessMessage && this.scrollIntoView && this.$refs.formResponseElement) {
          this.scrollIntoView(this.$refs.formResponseElement)
        }
      })

    }
  }
};
</script>

