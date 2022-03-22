<template>
  <v-checkbox
    class="ondigo-checkbox"
    :class="`ondigo-input-${identifier} ondigo-checkbox`"
    :error-messages="inputError"
    :label="label"
    :ref="'ref-' + identifier"
    :required="required"
    :rules="inputRules"
    validate-on-blur
    v-model="inputValue"
    :value="inputValue"
    :checked="inputValue"
    :name="name"
    hide-details="auto"
    off-icon="mdi-checkbox-blank"
  >
    <div v-if="properties.content" ref="contentLabel" slot="label" class="ondigo-content-element-wrapper" v-html="properties.content" />
  </v-checkbox>
</template>

<script>
import {createInputRules, isRequired} from "../../../lib/util";

export default {
  name: "OnCheckbox",

  props: {
    identifier: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    label: {
      type: String,
      default: null,
    },
    properties: {
      type: Object | Array,
      required: true,
    },
    requiredLabel: {
      type: String,
      default: "required",
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
      type: [String, Number, Boolean],
      default: null,
    },
    validators: {
      type: Array,
      required: false,
    },
  },

  mounted() {
    const contentLabel = this.$refs['contentLabel'];
    if (contentLabel) {
      /** @type HTMLElement[] */
      const links = Array.from(contentLabel.querySelectorAll('a'));
      links.forEach(elem => elem.addEventListener('click', e => e.stopPropagation()));
    }
  },

  computed: {
    required() {
      return isRequired(this.properties);
    },
    inputRules() {
      return createInputRules(this.required, this.validators, this.properties);
    },
    inputValue: {
      get() {
        return !!this.$store.getters.getCurrentInputValue(this.identifier);
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


