<template>
  <div>
    <input type="hidden" :name="name" v-model="formattedInput"/>
    <v-menu
        ref="menu"
        v-model="menu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto"
    >
      <template v-slot:activator="{ on, attrs }">
        <masked-text
            :mask-active="maskActive"
            :label="label"
            :placeholder="placeholder"
            :filled="filled"
            :id="id"
            ref="masked"
            :rules="menu ? [] : inputRules"
            :class="`ondigo-input ondigo-textfield ondigo-input-${id}`"
            :inputBridge="inputBridge"
            v-bind="{
            ...$attrs,
            name: undefined,
            properties: {
              ...properties,
              // mixin generated MaskedText properties
              pattern: maskPattern,
              placeholder: '_',
            },
          }"
            v-on="$listeners"
        >
          <template slot="append-masked">
            <div class="ondigo-icon-button" v-bind="attrs" v-on="on">
              <v-icon :color="menu ? 'primary' : ''">mdi-calendar</v-icon>
            </div>
          </template>
        </masked-text>
      </template>
      <v-date-picker
          v-model="date"
          :active-picker.sync="activePicker"
          :max="maxDate"
          :min="minDate"
          @change="save"
          :locale="locale || navigator.language || 'en-US'"
      />
    </v-menu>
  </div>
</template>

<script>
import {createInputRules, getPlaceholder, isRequired} from "../../lib/util";
import MaskedText from "./textfield_masked.vue";
import {
  compareDateTimes,
  formatISODateFromPattern,
  parseISODateFromPattern,
  toIsoFormatWithOffset,
} from "../../lib/time";

export default {
  name: "DatePicker",
  components: {
    MaskedText,
  },
  data: () => ({
    activePicker: null,
    date: null,
    menu: false,
    formattedInput: null,
  }),
  watch: {
    menu(val) {
      val && setTimeout(() => (this.activePicker = "YEAR"));
      this.$store.commit("setFormDisabled", val);
    },
    date() {
      this.inputBridge = this.formatDate(this.date);
    },
    inputBridge(val) {
      const parsed = this.parseDate(val);
      if (parsed && parsed !== this.date) this.date = parsed;

      const time = Date.parse(parsed);
      if (isNaN(time)) {
        this.formattedInput = null;
        return;
      }

      this.formattedInput = toIsoFormatWithOffset(new Date(time));
    },
  },
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
    formatDate(date) {
      if (!date) return null;

      const now = new Date();
      return formatISODateFromPattern(date, this.maskPattern, {
        // additional mappings for hour, minute
        H: String(now.getHours()).padStart(2, "0"),
        i: String(now.getMinutes()).padStart(2, "0"),
      });
    },
    parseDate(date) {
      if (!date) return null;

      return parseISODateFromPattern(
          date,
          this.maskPattern,
          // Getter for date components
          (match, order, identifier) => {
            const idx = order.indexOf(identifier);
            if (idx >= 0) return Number(match[idx + 1]); // order[i] = match[i + 1]

            // default values
            const now = new Date();
            switch (identifier) {
              case "Y":
                return now.getFullYear();
              case "m":
                return now.getMonth() + 1;
              case "d":
                return now.getDate();
              default:
                return undefined;
            }
          },
          // Interceptor, ensures invalid dates are not set
          (year, month, day) => {
            // check if date components are in allowed ranges
            if (
                month < 1 ||
                month > 12 ||
                day < 1 ||
                day > 31 ||
                year < 1000 ||
                year > 9999
            )
              return [null, true]; // invalid date, override with null

            // check if date components are in given min/max range (to prevent vuetify error throw)
            const inputDate = [year, month, day];
            if (
                (this.minDate && compareDateTimes(inputDate, this.minDate) < 0) /* date is before minDate */ ||
                (this.maxDate && compareDateTimes(inputDate, this.maxDate) > 0) /* date is after maxDate */
            ) {
              return [null, true]; // date out of selectable range, override with null
            }
            return [null, false]; // do not override
          }
      );
    },
    currentDate() {
      return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .substr(0, 10);
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
    placeholder() {
      return getPlaceholder(this.properties);
    },
    maskActive() {
      return !!this.properties.enableMask;
    },
    minDate() {
      if (!this.validators) return undefined;

      const validator = this.validators.find(
          (v) => v.identifier === "DateInterval"
      );
      if (!validator) return undefined;

      const minDate = validator.options?.minDate;
      if (!minDate) return undefined;

      if (minDate === "today") return this.currentDate();

      // parse date with date
      const date = Date.parse(minDate);
      return !isNaN(date) ? minDate : undefined;
    },
    maxDate() {
      if (!this.validators) return undefined;

      const validator = this.validators.find(
          (v) => v.identifier === "DateInterval"
      );
      if (!validator) return undefined;

      const maxDate = validator.options?.maxDate;
      if (!maxDate) return undefined;

      if (maxDate === "today") return this.currentDate();

      // parse date with date
      const date = Date.parse(maxDate);
      return !isNaN(date) ? maxDate : undefined;
    },
    maskPattern() {
      if (!this.maskActive) return "";

      let format = this.properties.dateFormat;
      if (!format) return "dd.mm.YYYY"; // fallback value

      // In PHP a format would be something like Y-m-d, but the mask pattern needs to be mapped to, in this case YYYY-mm-dd
      Object.entries({
        // Supported PHP format specifiers
        d: "dd",
        m: "mm",
        Y: "YYYY",
        H: "HH",
        i: "ii",
      }).forEach(([from, to]) => (format = format.replace(from, to)));

      return format; // is now pattern
    },
    locale() {
      return this.$store.getters.getCurrentSchema?.i18n;
    },
    inputRules() {
      return createInputRules(this.required, this.validators, {
        ...this.properties,
        pattern: this.maskPattern,
      });
    },
    inputBridge: {
      get() {
        return this.$store.getters.getCurrentInputValue(this.id) || "";
      },
      set(value) {
        this.$store.commit("updateInputValue", {key: this.id, value: value});
      },
    },
  },
};
</script>
