<template>
    <v-app>
      <div v-if="!formFinished">
        <single-step-form v-if="isSingleStepForm"/>
        <multi-step-form  v-else/>
      </div>
      <div v-if="formResponse" v-html="formResponse"></div>
    </v-app>
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
