<template>
  <on-select-base
      v-bind="$attrs"
      v-on="$listeners"
      :properties="properties"
      :identifier="identifier"

      :required="isRequired"
      :requiredLabel="requiredLabel"
      :errorMessages="inputError"
      :rules="inputRules"
      v-model="inputValue"
  />
</template>

<script lang="ts">
import 'reflect-metadata' // infer vue prop type validation by ts-definition; import this before vue-property-decorator!
import OnSelectBase from "../base/select/select.vue";
import {createInputRules, createRequiredLabel, isRequired,} from "@/lib/util";
import {Component, Prop} from "vue-property-decorator";
import {mixins} from "vue-class-component";
import InputValueMixin from "@/components/mixin/InputValueMixin";
import {ElementProperties, InputValidator} from "@/lib/FormDefinition";

@Component<OnSelect>({
  name: "OnSelect",
  components: {
    OnSelectBase: OnSelectBase,
  },
})
export default class OnSelect extends mixins(InputValueMixin) {
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

  get requiredLabel() {
    return createRequiredLabel(this.validators);
  }

  get inputRules() {
    return createInputRules(this.isRequired, this.validators, this.properties, true);
  }

  get inputValue() {
    return this.$store.getters.getCurrentInputValue(this.identifier) || "";
  }

  set inputValue(value) {
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
