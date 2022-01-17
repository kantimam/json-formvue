<template>
  <v-app :class="`ondigo-formvue-app formvue-${formSchema.configuration.identifier}`"
         :id="`formvue-${formSchema.configuration.id}`">
    <div class="ondigo-formvue">
      <div class="ondigo-form-wrapper" v-if="!formFinished">
        <single-step-form v-if="isSingleStepForm"/>
        <multi-step-form v-else/>
      </div>

      <component
          v-if="this.mixedComponents['FormResponse']"
          :is="this.mixedComponents['FormResponse']"
          :formName="formSchema.configuration.id"
          :response="formResponse"
          ref="formResponseElement"
      />
      <!-- Fallback response -->
      <div
          v-else-if="formResponse"
          v-html="formResponse"
          ref="formResponseElement"
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
        if (val && this.scrollToSuccessMessage && this.scrollIntoView) {
          this.scrollIntoView(this.$refs.formResponseElement)
        }
      })

    }
  }
};
</script>

