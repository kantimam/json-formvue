<template>
  <!-- <text-field v-bind="$attrs" v-on="$listeners" type="text" v-mask="{mask: 'G#:G#', tokens: {G: {pattern: /[0-2]/}, '#': {pattern: /\d/}}}" /> -->
  <text-field v-model="inputValue" v-bind="$attrs" v-on="$listeners" type="text" v-mask="properties.pattern" />
</template>
<script>
import TextField from './extended_text_field.vue'
  export default {
  name: "OnTextfieldMasked",
  components: {
    TextField
  },
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
  },
  props: {
    pattern: {
      type: String,
      default: null,
    },
    properties: {
      type: Object | Array,
      required: true,
    },
    rules: {
      type: [Object, Array],
      default() {
        return {} || [];
      }
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
    inputValue: {
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
