<template>
  <div class="ondigo-multistep-form-wrapper">
    <h2 class="mb-4 ondigo-form-header">
      step {{ currentStep }} of {{ lastStep }}
    </h2>
    <v-form
      class="ondigo-multi-step-form ondigo-form"
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
      <div class="d-flex justify-space-between mt-4">
        <v-btn
          type="button"
          v-if="currentStep > 1"
          @click="loadPreviousStep"
          color="secondary"
          class="ondigo-btn ondigo-btn-back"
        >
          {{ previousButtonLabel }}
        </v-btn>

        <v-btn
          type="submit"
          v-if="isLastStep"
          :loading="loading"
          color="primary"
          class="ondigo-btn ondigo-btn-submit"
        >
          {{ nextButtonLabel }}
        </v-btn>
        <v-btn
          type="submit"
          v-else
          :loading="loading"
          color="primary"
          class="ondigo-btn ondigo-btn-next"
        >
          {{ nextButtonLabel }}
        </v-btn>
      </div>
    </v-form>
  </div>
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
    errorCount() {
      return this.$store.state.errorCount;
    },
    currentStep() {
      return this.$store.state.currentStep;
    },

    lastStep() {
      return this.$store.state.lastStep;
    },

    isLastStep() {
      return this.currentStep === this.lastStep;
    },
    buttonLabels() {
      return (
        this.formConfig &&
        this.formConfig.api &&
        this.formConfig.api.page &&
        this.formConfig.api.page.labels
      );
    },
    previousButtonLabel() {
      return (
        (this.buttonLabels && this.buttonLabels.previousButtonLabel) ||
        "previous step"
      );
    },

    nextButtonLabel() {
      return (
        (this.buttonLabels && this.buttonLabels.nextButtonLabel) || "next step"
      );
    },
  },
  methods: {
    generateFormFieldName(inputName) {
      return `tx_form_formframework[${this.formConfig.id}][${inputName}]`;
    },
    handleFormSubmit() {
      const form = this.$refs.form;
      if (form) this.$store.dispatch("submitStep", form);
    },
    loadPreviousStep() {
      this.$store.commit("updateFormStep", this.currentStep - 1);
    },
  },
};
</script>
