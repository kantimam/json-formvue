<template>
  <v-form
    class="ondigo-form"
    :id="formConfig.id"
    @submit.prevent="handleFormSubmit"
    ref="form"
    :name="formConfig.identifier"
    :loading="loading"
  >
    <field-renderer
      v-for="fieldData in formConfig.elements"
      :key="fieldData.identifier"
      :formName="formConfig.id"
      :fieldData="fieldData"
    />
    <div v-show="errorCountLabel" class="error-summary">
      <a target="#" @click.prevent="scrollToFirstError">{{ errorCountLabel }}</a>
    </div>
    <v-btn
      :class="`ondigo-btn-submit ondigo-btn ${nextButtonAlignment}`"
      type="submit"
      :loading="loading"
      color="primary"
    >
      {{ nextButtonLabel }}
    </v-btn>
  </v-form>
</template>

<script>
export default {
  computed: {
    formConfig() {
      return this.$store.getters.getCurrentSchema;
    },
    loading() {
      return this.$store.state.loading;
    },
    errorCountLabel(){
      return this.$store.getters.getErrorLabel;
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

