<template>
  <on-checkbox-base
      v-bind="$attrs"
      :properties="properties"
      :identifier="identifier"

      :required="isRequired"
      :errorMessages="inputError"
      :rules="inputRules"
      v-model="inputValue"
  />
</template>
<script lang="ts">
import 'reflect-metadata' // infer vue prop type validation by ts-definition; import this before vue-property-decorator!
import OnCheckboxBase from "../base/checkbox/checkbox.vue";
import {createInputRules, isRequired} from "@/lib/util.ts";
import {Component, Prop} from "vue-property-decorator";
import {ElementProperties, InputValidator} from "@/lib/FormDefinition";
import {mixins} from "vue-class-component";
import InputValueMixin from "@/components/mixin/InputValueMixin";

@Component<OnCheckbox>({
  name: "OnCheckbox",
  components: {
    OnCheckboxBase: OnCheckboxBase
  }
})
export default class OnCheckbox extends mixins(InputValueMixin) {
  @Prop({
    default: () => []
  })
  readonly validators!: InputValidator[]

  @Prop()
  readonly properties!: ElementProperties

  @Prop()
  readonly identifier!: string

  get isRequired() {
    return isRequired(this.properties);
  }

  get inputRules() {
    return createInputRules(this.isRequired, this.validators, this.properties);
  }

  get inputValue() {
    return !!this.$store.getters.getCurrentInputValue(this.identifier);
  }

  set inputValue(value: any) {
    this.$store.commit("updateInputValue", {
      key: this.identifier,
      value: value
    });
  }

  get inputError() {
    return this.$store.getters.getCurrentInputError(this.identifier) || "";
  }
};
</script>
