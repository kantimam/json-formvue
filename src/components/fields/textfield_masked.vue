<template>
  <!-- Inspired by https://github.com/rafaelkendrik/imask-vuetify/blob/4b02dffc656c18926df374e3522c6446b1e86c51/components/html/ImaskField.vue -->
  <v-text-field
    ref="field"
    v-model="inputValue"
    :value="value"
    :autocomplete="properties['autoComplete']"
    @input="input"
    @focus="focus"
    @blur="blur"
    v-bind="$attrs"
    :placeholder="placeholder"
    :filled="filled"
    :required="required"
    :rules="inputRules"
    :error-messages="inputError"
    validate-on-blur
  >
    <template slot="prepend-outer"><slot name="prepend"></slot></template>
    <template slot="prepend-inner" v-if="!required">
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
      <slot name="append-masked">
        <div
          @click="menu = !menu"
          v-if="isTouchDevice && !!$slots.info"
          class="v-input__info"
        >
          <v-icon color="primary">mdi-information-outline</v-icon>
        </div>
      </slot>
    </template>
    <template slot="append-outer"><slot name="append"></slot></template>
  </v-text-field>
</template>
<script>
import IMask from "@ondigo-internal/imask";
import utils from "../../plugins/utils";
import {createInputRules, getPlaceholder, isRequired} from "../../lib/util";

export default {
  name: "OnTextfieldMasked",
  mounted() {
    this.initElement();

    // when a default value is set, init mask manually
    if (this.maskActive && this.inputValue && this.inputValue.length > 0)
      this.initMask();
  },
  model: {
    prop: "value",
    event: "input",
  },
  data: () => ({
    value: "",
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
    maskActive: {
      type: Boolean,
      default: true,
    },
    inputBridge: {
      type: String,
      required: false
    }
  },
  watch: {
    inputBridge(val) {
      if (!this.maskActive || (!this.required && val.length <= 0)) return;

      if (!this.masked || !this.element) this.initMask();

      this.element.value = val;
      this.element.dispatchEvent(new Event("input"));
    }
  },
  computed: {
    required() {
      return isRequired(this.properties);
    },
    placeholder() {
      return getPlaceholder(this.properties);
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
      const mask = {
        mask: this.properties.pattern,
        // custom character definitions
        definitions: {
          X: /[0-9a-zA-Z]/,
          C: /[A-Z]/,
          c: /[a-z]/,
        },
        // custom character block definitions
        blocks: {
          YYYY: {
            mask: IMask.MaskedRange,
            from: 1900,
            to: 9999,
            autofix: true,
          },
          mm: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 12,
            autofix: true,
          },
          dd: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 31,
            autofix: true,
          },
          HH: {
            mask: IMask.MaskedRange,
            from: 0,
            to: 23,
            autofix: true,
          },
          ii: {
            mask: IMask.MaskedRange,
            from: 0,
            to: 59,
            autofix: true,
          },
        },
      };

      let placeholderChar = this.properties.placeholder
        ? this.properties.placeholder.trim()
        : "";
      if (placeholderChar && placeholderChar.length > 0) {
        placeholderChar = placeholderChar.substring(0, 1); // in case someone put more than one character
        mask.placeholderChar = placeholderChar;
        mask.lazy = false;
      }

      return mask;
    },
    inputRules() {
      if (this.rules && Array.isArray(this.rules)) return this.rules;
      else return createInputRules(this.required, this.validators, this.properties, true, this.validatorsMap);
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
    initElement() {
      this.element = this.$refs.field.$el.querySelector("input");
    },
    initMask() {
      if (!this.maskActive) return;

      if (this.masked && this.masked.destroy) this.destroyMask();

      this.masked = IMask(this.element, this.mask);
    },
    destroyMask() {
      this.masked.destroy();
      this.masked = null;
    },
    // Event listeners
    input(value) {
      this.$emit("input", value);
    },
    focus() {
      if (this.maskActive && this.element.value.length <= 0) {
        this.initMask();

        this.element.value = this.masked.value;
        this.element.dispatchEvent(new Event("input"));

        setTimeout(() => {
          if (this.element.setSelectionRange) {
            this.element.setSelectionRange(0, 0);
          } else if (this.element.createTextRange) {
            const range = this.element.createTextRange();
            range.collapse(true);
            range.moveEnd("character", 0);
            range.moveStart("character", 0);
            range.select();
          }
        }, 20);
      }
    },
    blur() {
      if (!this.maskActive) return;

      const isNormalized = this.element.value === this.masked.value;
      if (!isNormalized) {
        this.element.value = this.masked.value;
        this.element.dispatchEvent(new Event("input"));
      }

      // Destroy mask, when element is not required, so that the element will look like before
      if (this.masked.unmaskedValue.length <= 0 && !this.required) {
        this.destroyMask();
        this.element.value = "";
        this.element.dispatchEvent(new Event("input"));
      }
    }
  },
  inject: ['validatorsMap']
};
</script>
