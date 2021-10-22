<template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="auto">
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="dateFormatted"
        :label="label"
	    	:placeholder="placeholder"
        :filled="filled"
        :class="`ondigo-input ondigo-textfield ondigo-input-${id}`">
      <template slot="append">
        <div
          v-bind="attrs"
          v-on="on">
          <v-icon :color="menu ? 'primary' : ''">mdi-calendar</v-icon>
        </div>
        </template>
      </v-text-field>
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
      @change="save">
    </v-date-picker>
  </v-menu>
</template>

<script>
import { createValidatorList, isRequired } from "../../lib/util";

export default {
  name: "DatePicker",
  data: () => ({
    activePicker: null,
    date: null,
    dateFormatted: null, // the user input
    menu: false,
  }),
  watch: {
    menu(val) {
      val && setTimeout(() => (this.activePicker = "YEAR"));
    },
    date() {
      this.dateFormatted = this.formatDate(this.date)
    },
    dateFormatted(val) {
      const parsed = this.parseDate(val);
      if (parsed && parsed !== this.date) this.date = parsed; 
    }
  },
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
    formatDate (date) {
      if (!date) return null

      const [year, month, day] = date.split('-')
      return `${day}.${month}.${year}`
    },
    parseDate (date) {
      if (!date) return null;

      const match = /^([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{4})$/g.exec(date);
      if (!match) return null;

      const [_match, day, month, year] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    },
  },
  props: {
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
    filled: {
      type: Boolean,
      default: false
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