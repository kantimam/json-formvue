<template>
  <on-text-field
    v-bind="$attrs"
    v-on="$listeners"
    :renderingOptions="renderingOptions"
    :validators="mergedValidators"
    type="url"
  />
</template>
<script lang="ts">
import TextField from "./textfield.vue";
import {Component, Prop, Vue} from "vue-property-decorator";
import {ElementRenderingOptions, InputValidator} from "@/lib/FormDefinition";

@Component({
  name: "OnTextFieldUrl",
  components: {
    OnTextField: TextField,
  }
})
export default class OnTextFieldUrl extends Vue{
  @Prop({
    default: () => {}
  })
  readonly renderingOptions!: ElementRenderingOptions

  @Prop({
    default: () => []
  })
  readonly validators!: InputValidator[]

  get mergedValidators() {
    const urlErrorMessage = this.renderingOptions?.urlErrorMessage;
    const urlValidator = {
      "identifier": "Url",
      "code": 1648217312,
      "errorMessage": urlErrorMessage
    };
    return [...this.validators, urlValidator];
  }
};
</script>
