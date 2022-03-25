<template>
  <on-text-field-base
      v-bind="$attrs"
      :properties="properties"
      :identifier="identifier"

      :required="isRequired"
      :requiredLabel="requiredLabel"
      :placeholder="placeholder"
      :errorMessages="inputError"
      :rules="inputRules"
      v-model="inputValue"
  />
</template>

<script lang="ts">
import 'reflect-metadata' // infer vue prop type validation by ts-definition; import this before vue-property-decorator!
import {createInputRules, createRequiredLabel, getPlaceholder, isRequired,} from "@/lib/util";
import OnTextFieldBase from "../base/textfield/textfield.vue";
import {Component, Prop} from "vue-property-decorator";
import {mixins} from "vue-class-component";
import InputValueMixin from "@/components/mixin/InputValueMixin";
import {ElementProperties, InputValidator} from "@/lib/FormDefinition";

@Component<OnTextField>({
  name: "OnTextField",
  components: {
    OnTextFieldBase: OnTextFieldBase
  },
})
export default class OnTextField extends mixins(InputValueMixin) {
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
    return createInputRules(this.isRequired, this.validators, this.properties, true);
  }

  get inputValue() {
    return this.$store.getters.getCurrentInputValue(this.identifier) || '';
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

  get placeholder() {
    return getPlaceholder(this.properties);
  }

  get requiredLabel() {
    return createRequiredLabel(this.validators);
  }
};
</script>

