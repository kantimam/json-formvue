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
    <v-btn
      :class="`ondigo-btn-submit ondigo-btn ${nextButtonAlignment}`"
      type="submit"
      :loading="loading"
      color="primary"
    >
      {{nextButtonLabel}}
    </v-btn>

  </v-form>
</template>

<script>

  export default {
    computed: {
      formConfig(){
        return this.$store.getters.getCurrentSchema
      },
      loading(){
        return this.$store.state.loading
      },
      buttonLabels(){
        return (this.formConfig && 
                this.formConfig.api && 
                this.formConfig.api.page && 
                this.formConfig.api.page.labels)
      },
      nextButtonLabel(){
        return this.buttonLabels && this.buttonLabels.nextButtonLabel || "submit"
      },
      nextButtonAlignment(){
        return (this.formConfig &&
                this.formConfig.api &&
                this.formConfig.api.page &&
                this.formConfig.api.page.submitButtonAlignment) || "left"
      }
    },
    methods: {
      generateFormFieldName(inputName){
        return`tx_form_formframework[${this.formConfig.id}][${inputName}]`
      },
      handleFormSubmit(){
        const form=this.$refs.form;
        if(form) this.$store.dispatch('submitStep', form);
        else console.log("could not find form element")
      }
      
    }
  }
</script>
