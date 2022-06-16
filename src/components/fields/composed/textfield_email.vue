<template>
  <on-text-field v-bind="$attrs" v-on="$listeners" type="email" />
</template>
<script lang="ts">
import OnTextField from './textfield.vue'
import {Component, Vue} from "vue-property-decorator";

@Component({
  name: "OnTextFieldEmail",
  components: {
    OnTextField: OnTextField
  },
})
export default class OnTextFieldEmail extends Vue {};
</script>
