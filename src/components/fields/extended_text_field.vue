<template>
  <text-field
    v-bind="{...$attrs, ...$props}"
    :rules="inputRules"
    :value="inputValue"
    @input="val=>inputValue=val"
    :required="required"
    :requiredLabel="requiredLabel"
    :errorMessages="inputError"
  />
</template>

<script>
import {createInputRules, createRequiredLabel, isRequired,} from "../../lib/util";
import TextFieldBase from "./base/textfield/textfield.vue";

export default {
  name: "OnTextfield",
  components: { TextField: TextFieldBase },
  props: {
    identifier: {
      type: String,
      required: true,
    },
    properties: {
      type: Object | Array,
      required: true,
    },
    validators: {
      type: Array,
      required: false,
    },
  },

  computed: {
    required() {
      return isRequired(this.properties);
    },
    placeholder() {
      return getPlaceholder(this.properties);
    },
    requiredLabel() {
      return createRequiredLabel(this.validators);
    },
    inputRules() {
      return createInputRules(this.required, this.validators, this.properties, true);
    },
    inputValue: {
      get() {
        return this.$store.getters.getCurrentInputValue(this.identifier) || "";
      },
      set(value) {
        this.$store.commit("updateInputValue", { key: this.identifier, value: value });
      },
    },
    inputError() {
      return this.$store.getters.getCurrentInputError(this.identifier) || "";
    },
  },
};
</script>

