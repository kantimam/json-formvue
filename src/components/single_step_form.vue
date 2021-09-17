<template>
  <v-form 
    :id="formConfig.id" 
    @submit.prevent="handleFormSubmit" 
    ref="form"
    :name="formConfig.identifier"
  >
    <field-renderer 
        v-for="fieldData in formConfig.elements"
        :key="fieldData.identifier"
        :formName="formConfig.id"
        :fieldData="fieldData"
    />
    <v-btn
      class="mr-4"
      type="submit"
    >
      {{nextButtonLabel}}
    </v-btn>
  </v-form>
</template>

<script>
  import { VForm, VBtn } from 'vuetify/lib';

  export default {
    name: 'App',
    components: {
        VForm,
        VBtn,
    },
    computed: {
      formConfig(){
        return this.$store.getters.getCurrentSchema
      },
      buttonLabels(){
        return (this.formConfig && 
                this.formConfig.api && 
                this.formConfig.api.page && 
                this.formConfig.api.page.labels)
      },
      nextButtonLabel(){
        return this.buttonLabels && this.buttonLabels.nextButtonLabel || "submit"
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
