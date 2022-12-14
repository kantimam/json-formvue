<template>
  <v-radio-group
    @blur="blur"
    @change="change"
    @focus="focus"
    :class="`ondigo-input-${identifier} ondigo-radio`"
    :error-messages="inputError"
    :identifier="identifier"
    @input="input"
    :label="label"
    :ref="'ref-' + identifier"
    :required="required"
    :rules="inputRules"
    v-model="inputValue"
    color="red"
    :name="name"
    hide-details="auto"
  >
    <v-radio
      v-for="option in radioOptions"
      :key="option.value"
	    :check="inputValue === option.value"
      :label="option.label"
      :value="option.value"
    ></v-radio>
  </v-radio-group>
</template>

<script>
import {createInputRules, createRequiredLabel, isRequired} from "../../lib/util";

export default {
  name: "OnRadio",

  props: {
    autocomplete: {
      type: String,
      default: null,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    clearicon: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
    counter: {
      type: [Number, String],
      default: null,
      validator: function (value) {
        return /^\d+$/.test(value);
      },
    },
    defaultValue: {
      type: String,
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    focused: {
      type: Boolean,
      default: false,
    },
    hidedetails: {
      type: Boolean,
      default: false,
    },
    identifier: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    inputmode: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    optional: {
      type: Boolean,
      default: false,
    },
    optionalLabel: {
      type: String,
      default: "optional",
    },
    placeholder: {
      type: String,
      default: null,
    },
    prefix: {
      type: String,
      default: null,
    },
    properties: {
      type: Object | Array,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: [Object, Array],
      default() {
        return {} || [];
      },
    },
    type: {
      type: String,
      default: "text",
    },
    value: {
      type: [String, Number],
      default: null,
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
    requiredLabel() {
      return createRequiredLabel(this.validators);
    },
    inputRules() {
      return createInputRules(this.required, this.validators, this.properties);
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
    radioOptions() {
      const optionsArray = [];
      if (!this.properties || !this.properties.options) return optionsArray;

      const options = this.properties.options;
      for (const prop in options) {
        optionsArray.push({
          value: prop,
          label: options[prop],
        });
      }

      return optionsArray;
    },
  },

  methods: {
    change(e) {
      this.$emit("change", e);
    },
    input(e) {
      this.$emit("input", e);
    },
    focus(e) {
      this.$emit("focus", e);
    },
    blur(e) {
      this.$emit("blur", e);
    },
  },
};
</script>
