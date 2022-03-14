<template>
  <v-form
      :class="`ondigo-form form-${formConfig.identifier}`"
      :data-form-identifier="formConfig.id"
      @submit.prevent="handleFormSubmit"
      ref="form"
      :loading="loading"
      :disabled="disabled"
  >
    <slot name="prepend-inner"></slot>
    <dynamic-element
        v-for="element in formConfig.elements"
        :key="element.identifier"
        :formName="formConfig.id"
        :element="element"
    />
    <div v-show="errorCountLabel" class="error-summary input-errors">
      <a target="#" @click.prevent="scrollToFirstError">{{ errorCountLabel }}</a>
    </div>
    <div v-show="formErrors && formErrors.length" class="error-summary form-errors">
      <p v-for="error in formErrors" class="error-summary-item">{{ error }}</p>
    </div>
    <slot name="append-inner"></slot>
    <component
        v-if="componentsMap['SubmitButton']"
        :is="componentsMap['SubmitButton']"
        :loading="loading"
        :btn-label="nextButtonLabel"
        :alignment="nextButtonAlignment"
        :disabled="disabled"
        :formName="formConfig.id"
    />
    <v-btn
        type="submit"
        v-else
        :loading="loading"
        color="primary"
        class="ondigo-btn"
        :disabled="disabled"
    >
      {{ nextButtonLabel }}
    </v-btn>
  </v-form>
</template>

<script>
import dynamic_element from "./dynamic_element.vue";

export default {
  components: {
    'dynamic-element': dynamic_element
  },
  computed: {
    formConfig() {
      return this.$store.getters.getCurrentSchema;
    },
    errorCountLabel() {
      return this.$store.getters.getErrorLabel;
    },
    formErrors() {
      return this.$store.getters.getFormErrors;
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
  data() {
    return {
      formModel: {},
      formErrorCount: 0,
      errorSummary: ""
    }
  },
  inject: ["scrollIntoView", "componentsMap"],
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
        if (this.scrollIntoView) {
          this.scrollIntoView(firstInputWithError);
        }
      }
    },
  },
};
</script>

