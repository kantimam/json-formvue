<template>
  <v-app>
    <div v-if="!formFinished">
      <single-step-form v-if="isSingleStepForm"/>
      <multi-step-form  v-else/>
      <fileupload/>
    </div>
    <div v-if="formResponse" v-html="formResponse"></div>
  </v-app>
</template>

<script>
import { VApp } from 'vuetify/lib';
import MultiStepForm from './components/multi_step_form.vue';
import SingleStepForm from './components/single_step_form.vue';
import Fileupload from "./components/fields/fileupload.vue";

export default {
  name: 'App',
  components: {
    Fileupload,
    VApp,
    SingleStepForm,
    MultiStepForm
  },
  mounted() {
    console.log(this.$appName)
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
