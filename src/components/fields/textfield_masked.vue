<template>
  <!-- Inspired by https://github.com/rafaelkendrik/imask-vuetify/blob/4b02dffc656c18926df374e3522c6446b1e86c51/components/html/ImaskField.vue -->
  <v-text-field
    ref="field"
    v-model="inputValue"
    :value="value"
    @input="input"
    @focus="focus"
    @blur="checkNormalize"
    v-bind="$attrs"
    :filled="filled"
    :required="required"
    :rules="validateField"
    :error-messages="inputError"
    validate-on-blur>
    <template slot="prepend-outer"><slot name="prepend"></slot></template>
    <template slot="prepend-inner" v-if="optional">
      <span class="v-input__label-optional">
        {{ optionalLabel }}
      </span>
    </template>
    <template slot="prepend-inner" v-if="required">
      <span class="v-input__label-required">
        {{ requiredLabel }}
      </span>
    </template>
    <template slot="append">
      <div
        @click="menu = !menu"
        v-if="isTouchDevice && !!$slots.info"
        class="v-input__info">
        <v-icon color="primary">mdi-information-outline</v-icon>
      </div>
    </template>
    <template slot="append-outer"><slot name="append"></slot></template>
  </v-text-field>
</template>
<script>
import IMask from "imask";
import utils from "../../plugins/utils";
import { createValidatorList, isRequired } from "../../lib/util";

export default {
  name: "OnTextfieldMasked",
  mounted() {
    this.init();
  },
  model: {
    prop: 'value',
    event: 'input',
  },
  data: () => ({
    value: '',
    element: {},
    masked: {},
    isTouchDevice: utils.isTouchDevice(),
  }),
  props: {
    filled: {
      type: Boolean,
      default: false,
    },
    properties: {
      type: Object | Array,
      required: true,
    },
    rules: {
      type: [Object, Array],
      default() {
        return {} || [];
      },
    },
    validators: {
      type: Array,
      required: false,
    },
    optional: {
      type: Boolean,
      default: false,
    },
    optionalLabel: {
      type: String,
      default: "optional",
    },
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    required() {
      return isRequired(this.properties);
    },
    requiredLabel() {
      if (!this.validators || !this.validators.length) return "required";
      const notEmptyValidator = this.validators.find(
        (v) => v.identifier === "NotEmpty"
      );
      return (
        (notEmptyValidator && notEmptyValidator.errorMessage) || "required"
      );
    },
    mask() {
      return {
        mask: this.properties.pattern,
        placeholderChar: '_',
        lazy: false,
        // custom character block definitions
        blocks: {
          'YYYY': {
            mask: IMask.MaskedRange,
            from: 1900,
            to: 9999,
            autofix: true
          },
          'mm': {
            mask: IMask.MaskedRange,
            from: 1,
            to: 12,
            autofix: true
          },
          'dd': {
            mask: IMask.MaskedRange,
            from: 1,
            to: 31,
            autofix: true
          },
          'HH': {
            mask: IMask.MaskedRange,
            from: 0,
            to: 23,
            autofix: true
          },
          'ii': {
            mask: IMask.MaskedRange,
            from: 0,
            to: 59,
            autofix: true
          }
        }
      };
    },
    required() {
      return isRequired(this.properties);
    },
    validateField() {
      let r = {};
      const validate = [];

      // default validation
      if (!!this.required) {
        r.required = (v) => !!v;
      }

      const propsValidationMap = createValidatorList(this.validators, undefined, this.properties);

      // combine default validation and custom validation
      r = Object.assign(r, propsValidationMap);

      // create array for text-field syntax
      for (const key of Object.keys(r)) {
        validate.push(r[key]);
      }
      return validate;
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
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
    init() {
      this.element = this.$refs.field.$el.querySelector("input");
      this.masked = IMask(this.element, this.mask);
    },
    input(value) {
      this.$emit('input', value);
    },
    focus() {
      if (this.element.value.length <= 0) {
        this.element.value = this.masked.value;
        this.element.dispatchEvent(new Event('input'));

        // move caret to first index, because this sometimes doesn't happen
        if (this.element.setSelectionRange) {
          this.element.setSelectionRange(0, 0);
        }
        else if (this.element.createTextRange) {
          const range = this.element.createTextRange();
          range.collapse(true);
          range.moveEnd('character', 0);
          range.moveStart('character', 0);
          range.select();
        }
      }
    },
    checkNormalize() {
      const isNormalized = this.element.value === this.masked.value;
      if (!isNormalized) {
        this.element.value = this.masked.value;
        this.element.dispatchEvent(new Event('input'));
      }
    },
  }
};
</script>
