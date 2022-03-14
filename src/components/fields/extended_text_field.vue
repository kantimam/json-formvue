<template>
  <text-field
    v-bind="{...$attrs, ...$props}"
    :id="id"
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
import TextField from "./textfield.vue";

export default {
  name: "OnTextfield",
  components: { TextField },
  props: {
    id: {
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
        return this.$store.getters.getCurrentInputValue(this.id) || "";
      },
      set(value) {
        this.$store.commit("updateInputValue", { key: this.id, value: value });
      },
    },
    inputError() {
      return this.$store.getters.getCurrentInputError(this.id) || "";
    },
  },
};
</script>

