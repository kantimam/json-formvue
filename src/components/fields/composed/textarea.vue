<template>
  <on-textarea-base
      v-bind="$attrs"
      v-on="$listeners"
      :properties="properties"
      :identifier="identifier"

      :required="isRequired"
      :requiredLabel="requiredLabel"
      :placeholder="placeholder"
      :errorMessages="inputError"
      :rules="inputRules"
      v-model="inputValue"

      :maxLength="maxLength"
  />
</template>

<script lang="ts">
import 'reflect-metadata' // infer vue prop type validation by ts-definition; import this before vue-property-decorator!
import OnTextareaBase from "../base/textarea/textarea.vue";
import {createInputRules, createRequiredLabel, getPlaceholder, isRequired,} from "@/lib/util";
import {Component, Prop} from "vue-property-decorator";
import {mixins} from "vue-class-component";
import InputValueMixin from "@/components/mixin/InputValueMixin";
import {ElementProperties, InputValidator} from "@/lib/FormDefinition";

@Component<OnTextarea>({
  name: "OnTextarea",
  components: {
    OnTextareaBase: OnTextareaBase,
  },
})
export default class OnTextarea extends mixins(InputValueMixin) {
  @Prop({
    default: () => []
  })
  readonly validators!: InputValidator[]

  @Prop()
  readonly properties!: ElementProperties

  @Prop()
  readonly identifier!: string

  @Prop({
    default: () => null
  })
  readonly counter!: number | null

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

  get placeholder() {
    return getPlaceholder(this.properties);
  }

  get maxLength() {
    if (this.validators && Array.isArray(this.validators)){
      const stringLengthValidator = this.validators.find(val => val.identifier === 'StringLength');
      if (stringLengthValidator && stringLengthValidator.options && stringLengthValidator.options.maximum) {
        return parseInt(stringLengthValidator.options.maximum);
      }
    }
    return this.counter;
  }
};
</script>
