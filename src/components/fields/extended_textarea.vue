<template>
  <v-textarea
    :autocomplete="autocomplete"
    auto-size
    @blur="blur"
    :class="`ondigo-input ondigo-textarea ondigo-input-${id}`"
    :color="color"
    :counter="counter"
    :disabled="disabled"
    :error="inputError !== ''"
    :filled="filled"
    :outlined="outlined"
    :solor="solo"
    @focus="focus"
    hide-details="auto"
    :id="id"
    :inputmode="inputmode"
    :label="label"
    :loading="loading"
    :messages="inputError"
    :name="name"
    :placeholder="placeholder"
    :prefix="prefix"
    v-model="inputValue"
    :readonly="readonly"
    :ref="'ref-' + id"
    :required="required"
    :rules="validateField"
    :suffix="suffix"
    :type="type"
    v-bind:class="{
      'v-text-field--required': required,
      'v-text-field--optional': optional,
      'v-text-field--counting': counter,
      'v-text-field--updated': updated,
    }"
    validate-on-blur
  >
    <template slot="prepend-outer"><slot name="prepend"></slot></template>
    <template slot="prepend-inner" v-if="optional"
      ><span class="v-input__label-optional">{{
        optionalLabel
      }}</span></template
    >
    <template slot="prepend-inner" v-if="required"
      ><span class="v-input__label-required">{{
        requiredLabel
      }}</span></template
    >
    <template slot="append-outer"><slot name="append"></slot></template>
  </v-textarea>
</template>

<script>
import { VTextarea } from "vuetify/lib";
import { createValidatorList, isRequired } from "../../lib/util";

export default {
  name: "OnTextarea",

  components: {
    VTextarea,
  },

  props: {
    autocomplete: {
      type: String,
      default: null,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "text",
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
    disabled: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    solo: {
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
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    defaultValue: {
      type: String,
      required: false,
    },
    inputmode: {
      type: String,
      default: "text",
    },
    label: {
      type: String,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
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
    suffix: {
      type: String,
      default: null,
    },
    validators: {
      type: Array,
      required: false,
    },
    properties: {
      type: Object | Array,
      required: true,
    },
  },

  data() {
    return {
      updated: false,
    };
  },

  watch: {
    focused(focused) {
      // set focus to input tag
      if (focused) {
        this.$refs["ref-" + this.id].$refs.input.focus();
      } else {
        this.$refs["ref-" + this.id].$refs.input.blur();
      }
    },
    loading(loading) {
      if (!loading) return;
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
    validateField() {
      let r = {};
      const validate = [];

      // default validation
      if (!!this.required) {
        r.required = (v) => !!v;
      }

      const propsValidationMap = createValidatorList(this.validators);

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
    blur(e) {
      this.$emit("blur", e);
    },
    change(e) {
      this.$emit("change", e);
    },
    focus(e) {
      this.$emit("focus", e);
    },
    input(e) {
      this.$emit("input", e);
    },
    update() {
      let _scope = this;
      this.updated = true;

      setTimeout(function () {
        _scope.updated = false;
      }, 1500);
    },
  },
};
</script>
