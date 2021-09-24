<template>
    <div class="ondigo-formvue">
      <div class="ondigo-form-wrapper" v-if="!formFinished">
        <single-step-form v-if="isSingleStepForm"/>
        <multi-step-form  v-else/>
      </div>
      <div v-if="formResponse" v-html="formResponse"></div>
    </div>
</template>

<script>
  import MultiStepForm from './components/multi_step_form.vue';
  import SingleStepForm from './components/single_step_form.vue';

  export default {
    components: {
      SingleStepForm,
      MultiStepForm
    },
    computed: {
      formFinished(){
        return this.$store.state.formFinished
      },
      formResponse(){
        return this.$store.state.formResponse
      },
      isSingleStepForm(){
        return this.$store.getters.getIsSingleStep
      }
    }
  }
</script>
