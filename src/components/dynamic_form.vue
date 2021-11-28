<template>
  <v-form
      class="ondigo-form"
      :id="formConfig.id"
      @submit.prevent="handleFormSubmit"
      ref="form"
      :name="formConfig.identifier"
      :loading="loading"
  >
    <dynamic-element
        v-for="element in formConfig.elements"
        :key="element.identifier"
        :formName="formConfig.id"
        :element="element"
    />
    <div v-show="errorCountLabel" class="error-summary my-8">
      <a
          class="text-decoration-underline error--text"
          @click.prevent="scrollToFirstError"
      >{{ errorCountLabel }}</a
      >
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
      errorSummary: "",
      formModel: {

      },
      formErrorCount: 0,
      loading: false
    }
  },
  inject: ["scrollToErrorCallback"],
  methods: {
    getInputModel(inputName){
      return this.formModel[inputName] || {value: '', error: ''}
    },
    handleFormSubmit() {
      const form = this.$refs.form;
      this.$emit('submit_success', form);
      this.$emit('submit_fail', form);
    },
    setInputModel(inputName, value){
      const inputModel=this.formModel[inputName] || {value: '', error: ''};
      inputModel.value=value;
    },
    setInputError(inputName, value){
      const inputModel=this.formModel[inputName] || {value: '', error: ''};
      inputModel.error=value;
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
  provide() {
    return {
      getInputModel: this.getInputModel,
      setInputValue: this.setInputModel,
      setInputError: this.setInputModel
    }
  }
};
</script>

