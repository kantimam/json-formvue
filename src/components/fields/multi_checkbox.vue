<template>
  <div>
    <!-- These are not the checkboxes to sent -->
    <v-checkbox
      v-for="option in Object.entries(properties.options)"
      :key="option[0]"
      class="ondigo-checkbox"
      :class="`ondigo-input-${identifier}-${option[0]} ondigo-checkbox`"
      :label="option[1]"
      :identifier="identifier"
      :ref="`ref-${identifier}-${option[0]}`"
      v-model="checked[option[0]]"
      hide-details="auto"
      off-icon="mdi-checkbox-blank"
      :rules="inputRules"
    />
    <input
      v-for="option in selectedOptions"
      type="hidden"
      :key="'val-'.concat(option)"
      :name="name.concat('[]')"
      :value="option"
    />
  </div>
</template>

<script>
import {createInputRules} from "../../lib/util";

export default {
  name: "OnMultiCheckbox",

  data() {
    return {
      checked: Object.entries(this.properties.options).reduce(
        // initialize all values to false
        (prev, [key]) => ({ ...prev, [key]: false }),
        {}
      ),
    };
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
      type: [String, Number, Boolean],
      default: null,
    },
    validators: {
      type: Array,
      required: false,
    },
  },

  computed: {
    inputRules() {
      return createInputRules(this.required, this.validators, this.properties);
    },
    selectedOptions() {
      return Object.keys(this.properties.options).filter(
        (val) => this.checked[val]
      );
    },
    inputError() {
      return this.$store.getters.getCurrentInputError(this.identifier) || "";
    },
  },
};
</script>


