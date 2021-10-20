<template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="date"
        label="Birthday date"
        readonly
        v-bind="attrs"
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="date"
      :active-picker.sync="activePicker"
      :max="
        new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .substr(0, 10)
      "
      min="1900-01-01"
      @change="save"
    ></v-date-picker>
  </v-menu>
</template>

<script>
import { createValidatorList, isRequired } from "../../lib/util";

export default {
  name: "DatePicker",
  data: () => ({
    activePicker: null,
    date: null,
    menu: false,
  }),
  watch: {
    menu(val) {
      val && setTimeout(() => (this.activePicker = "YEAR"));
    },
  },
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
  },
  props: {
    clearicon: {
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
    defaultValue: {
      type: String,
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    focused: {
      type: Boolean,
      default: false,
    },
    id: {
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
    placeholder: {
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
      },
    },
    type: {
      type: String,
      default: "text",
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


