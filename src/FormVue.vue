<template>
  <v-app class="ondigo-formvue-app">
    <div class="ondigo-formvue">
      <div class="ondigo-form-wrapper" v-if="!formFinished">
        <single-step-form v-if="isSingleStepForm" />
        <multi-step-form v-else />
      </div>
      <div v-if="formResponse" v-html="formResponse"></div>
    </div>
  </v-app>
</template>

<script>
import MultiStepForm from "./components/multi_step_form.vue";
import SingleStepForm from "./components/single_step_form.vue";

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
      componentsMap: Object.freeze(this.componentsMap),
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
  },
};
</script>

