<template>
  <v-textarea
      :autocomplete="properties['autoComplete']"
      auto-size
      @blur="blur"
      :color="color"
      :counter="maxLength"
      :disabled="disabled"
      :filled="filled"
      :outlined="outlined"
      :solo="solo"
      @focus="focus"
      hide-details="auto"
      :inputmode="inputmode"
      :identifier="identifier"
      :label="label"
      :loading="loading"
      :error-messages="inputError"
      :name="name"
      :placeholder="placeholder"
      :prefix="prefix"
      v-model="inputValue"
      :readonly="readonly"
      :ref="'ref-' + identifier"
      :required="required"
      :rules="inputRules"
      :suffix="suffix"
      :type="type"
      v-bind:class="
      [{
        'v-text-field--required': required,
        'v-text-field--optional': !required,
        'v-text-field--counting': maxLength,
        'v-text-field--updated': updated,
      },
      'ondigo-input',
      'ondigo-textarea',
      `ondigo-input-${identifier}`]
    "
      validate-on-blur
  >
    <template slot="prepend-outer"><slot name="prepend"></slot></template>
    <template slot="prepend-inner" v-if="!required">
		<span class="v-input__label-optional">
			{{optionalLabel }}
		</span>
    </template>
    <template slot="prepend-inner" v-if="required"
    ><span class="v-input__label-required">{{
        requiredLabel
      }}</span></template
    >
    <template slot="append-outer"><slot name="append"></slot></template>
  </v-textarea>
</template>

<script>
import {VTextarea} from "vuetify/lib";
import {createInputRules, createRequiredLabel, isRequired,} from "../../lib/util";

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
    identifier: {
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
      updated: false
    };
  },

  watch: {
    focused(focused) {
      // set focus to input tag
      if (focused) {
        this.$refs["ref-" + this.identifier].$refs.input.focus();
      } else {
        this.$refs["ref-" + this.identifier].$refs.input.blur();
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
    maxLength(){
      if(this.validators && Array.isArray(this.validators)){
        const stringLengthValidator=this.validators.find(val=>val.identifier==='StringLength');
        if(stringLengthValidator && stringLengthValidator.options && stringLengthValidator.options.maximum){
          return parseInt(stringLengthValidator.options.maximum);
        }
      }
      return null;
    }
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
