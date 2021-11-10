<template>
  <!-- Inspired by https://github.com/rafaelkendrik/imask-vuetify/blob/4b02dffc656c18926df374e3522c6446b1e86c51/components/html/ImaskField.vue -->
  <v-text-field
    ref="field"
    :value="value"
    @input="input"
    @focus="focus"
    @blur="checkNormalize"
    v-bind="$attrs"
  />
</template>
<script>
import IMask from "imask";

export default {
  name: "OnTextfieldMasked",
  model: {
    prop: 'value',
    event: 'input',
  },
  data: () => ({
    value: '',
    element: {},
    masked: {},
  }),
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
      this.inputValue = this.masked.value;
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
  },
  mounted() {
    this.init();
  },
  props: {
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
  },
  computed: {
    mask() {
      return {
        mask: this.properties.pattern,
        placeholderChar: '_',
        lazy: false
      };
    },
    required() {
      return isRequired(this.properties);
    },
    validateField() {
      //if(!this.required) return []
      let r = {};
      const validate = [];

      const propsValidationMap = createValidatorList(this.validators);
      // combine default validation and custom validation
      r = Object.assign(r, this.rules, propsValidationMap);
      // create array for text-field syntax

      for (const key in r) {
        validate.push(r[key]);
      }

      return validate;
    },
    inputValue: { // TODO integrate
      get() {
        return this.$store.getters.getCurrentInputValue(this.id) || "";
      },
      set(value) {
        this.$store.commit("updateInputValue", { key: this.id, value: value });
      },
    },
  },
};
</script>
