<template>
  <v-form
    class="ondigo-form"
    :id="formConfig.id"
    @submit.prevent="handleFormSubmit"
    ref="form"
    :name="formConfig.identifier"
    :loading="loading"
    :disabled="disabled"
  >
	  <dynamic-element
		  v-for="element in formConfig.elements"
		  :key="element.identifier"
		  :formName="formConfig.id"
		  :element="element"
	  />
    <div v-show="errorCountLabel" class="error-summary">
      <a target="#" @click.prevent="scrollToFirstError">{{ errorCountLabel }}</a>
    </div>
    <v-btn
      :class="`ondigo-btn-submit ondigo-btn ${nextButtonAlignment}`"
      type="submit"
      :loading="loading"
      color="primary"
      :disabled="disabled"
    >
      {{ nextButtonLabel }}
    </v-btn>
  </v-form>
</template>

<script>
import dynamic_element from "./dynamic_element.vue";
export default {
	components:{
		'dynamic-element': dynamic_element
	},
  computed: {
    formConfig() {
      return this.$store.getters.getCurrentSchema;
    },
	  errorCountLabel(){
		  return this.$store.getters.getErrorLabel;
	  },
    loading() {
      return this.$store.state.loading;
    },
    disabled() {
      return this.$store.state.formDisabled;
    },
    buttonLabels() {
      return (
        this.formConfig &&
        this.formConfig.api &&
        this.formConfig.api.page &&
        this.formConfig.api.page.labels
      );
    },
    nextButtonLabel() {
      return (
        (this.buttonLabels && this.buttonLabels.nextButtonLabel) || "submit"
      );
    },
    nextButtonAlignment() {
      return (
        (this.formConfig &&
          this.formConfig.api &&
          this.formConfig.api.page &&
          this.formConfig.api.page.submitButtonAlignment) ||
        "left"
      );
    },
  },
  data(){
    return {
      formModel: {

      },
      formErrorCount: 0,
      errorSummary: ""
    }
  },
  inject: ["scrollToErrorCallback"],
  methods: {
    handleFormSubmit() {
      const form = this.$refs.form;
      if (form) this.$store.dispatch("submitStep", form);
    },
    scrollToFirstError() {
      const firstInputWithError = this.$refs.form.$el.querySelector(
        ".v-input.error--text"
      );
      if (firstInputWithError) {
        if (this.scrollToErrorCallback) {
          this.scrollToErrorCallback(firstInputWithError);
        }
      }
    },
  },
};
</script>

