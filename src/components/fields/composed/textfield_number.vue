<template>
  <on-text-field v-bind="$attrs" v-on="$listeners" type="number" />
</template>
<script lang="ts">
import OnTextField from './textfield.vue'
import {Component, Vue} from "vue-property-decorator";

@Component({
  name: "OnTextFieldNumber",
  components: {
    OnTextField: OnTextField
  },
})
export default class OnTextFieldNumber extends Vue {};
</script>
