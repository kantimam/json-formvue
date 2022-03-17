<template>
  <div class="ondigo-advanced-password">
    <text-field
      v-bind="$attrs"
      :label="label"
      :name="`${name}[password]`"
      :rules="inputRules"
      v-model="passwordValue"
      :required="required"
      :requiredLabel="requiredLabel"
      outlined
      type="password"
      ref="password"
    />
    <text-field
      v-bind="$attrs"
      :label="`${label} repeat`"
      :name="`${name}[confirmation]`"
      :rules="passwordMatchingValidator"
      v-model="passwordRepeatValue"
      :required="required"
      :requiredLabel="requiredLabel"
      outlined
      type="password"
      ref="passwordConfirm"
    />
  </div>
</template>

<script>
import {createInputRules, createRequiredLabel, isRequired,} from "../../lib/util";
import TextField from "./textfield/textfield.vue";

export default {
  name: "OnAdvancedPassword",
  components: { TextField },
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
    },
    properties: {
      type: Object | Array,
      required: true,
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
        return this.$store.getters.getCurrentInputValue(this.id) || "";
      },
      set(value) {
        this.$store.commit("updateInputValue", { key: this.id, value: value });
      },
    },
    passwordMatchingValidator() {
      const pwdRepeatValidators = [
        (inputValue) =>
          inputValue === this.passwordValue || "passwords do not match",
      ];
      if (!!this.required) {
        pwdRepeatValidators.unshift((v) => !!v);
      }
      return pwdRepeatValidators;
    },
    passwordValue: {
      get() {
        return this.$store.getters.getCurrentInputValue(this.id) || "";
      },
      set(value) {
        this.$store.commit("updateInputValue", { key: this.id, value: value });
      },
    },
    passwordRepeatValue: {
      get() {
        return (
          this.$store.getters.getCurrentInputValue(`${this.id}-repeat`) || ""
        );
      },
      set(value) {
        this.$store.commit("updateInputValue", {
          key: `${this.id}-repeat`,
          value: value,
        });
      },
    },
    inputError() {
      return this.$store?.getters.getCurrentInputError(this.id) || "";
    },
  },
};
</script>
