<template>
  <on-text-field v-bind="$attrs" v-on="$listeners" type="password" />
</template>
<script lang="ts">
import OnTextField from './textfield.vue'
import {Component, Vue} from "vue-property-decorator";

@Component({
  name: "OnTextFieldPassword",
  components: {
    OnTextField: OnTextField
  },
})
export default class OnTextFieldPassword extends Vue {};
</script>
