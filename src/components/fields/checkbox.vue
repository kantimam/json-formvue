<template>
  <v-checkbox
    class="ondigo-checkbox"
    :class="`ondigo-input-${id} ondigo-checkbox`"
    :error-messages="inputError"
    :id="id"
    :label="label"
    :ref="'ref-' + id"
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
    <div v-if="properties.link" class="ondigo-label-wrapper" slot="label">
      <p class="ondigo-label-p">
        {{ label }}
        {{ " " }}
        <a
          @click.stop
          class="ondigo-label-a"
          v-bind:target="properties.openInNewWindow ? '_blank' : '_self'"
          v-bind:data-overlay="properties.openInOverlay == 'true' ? 1 : null"
          :href="properties.link"
        >
          {{ properties.linkText }}
        </a>
      </p>
    </div>
  </v-checkbox>
</template>

<script>
import { createInputRules, isRequired } from "../../lib/util";

export default {
  name: "OnCheckbox",

  props: {
    id: {
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

  computed: {
    required() {
      return isRequired(this.properties);
    },
    inputRules() {
      createInputRules(this.required, this.validators, this.properties);
    },
    inputValue: {
      get() {
        return this.$store.getters.getCurrentInputValue(this.id) || "";
      },
      set(value) {
        this.$store.commit("updateInputValue", { key: this.id, value: value });
      },
    },
    inputValue: {
      get() {
        return this.$store.getters.getCurrentInputValue(this.id) ? true : false;
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


