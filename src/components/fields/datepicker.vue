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
      <masked-text
        :mask-active="maskActive"
        :label="label"
        :placeholder="placeholder"
        :filled="filled"
        :name="name"
        :id="id"
        ref="masked"
        :class="`ondigo-input ondigo-textfield ondigo-input-${id}`"
        :inputBridge="inputBridge"
        v-bind="{
          ...$attrs,
          properties: {
            ...$attrs.properties,
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
    >
    </v-date-picker>
  </v-menu>
</template>

<script>
import {
  getMaskPatternToRegexMatches,
  matchMaskPattern,
} from "../../lib/pattern";
import {
  createValidatorList,
  isRequired,
  getPlaceholder,
} from "../../lib/util";
import MaskedText from "./textfield_masked.vue";

export default {
  name: "DatePicker",
  components: {
    MaskedText,
  },
  data: () => ({
    activePicker: null,
    date: null,
    menu: false,
  }),
  watch: {
    menu(val) {
      val && setTimeout(() => (this.activePicker = "YEAR"));
    },
    date() {
      this.inputBridge = this.formatDate(this.date);
    },
    inputBridge(val) {
      const parsed = this.parseDate(val);
      if (parsed && parsed !== this.date) this.date = parsed;
    },
  },
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      const now = new Date();
      const substitutes = {
        d: day,
        m: month,
        Y: year,
        H: now.getHours(),
        i: now.getMinutes(),
      };

      const format = this.maskPattern;
      const matches = getMaskPatternToRegexMatches(format);

      let cursor = 0;
      const patternSegments = [];

      matches.forEach((match) => {
        const str = match[0];
        const len = str.length;
        const firstChar = str[0];

        const group = firstChar in substitutes ? substitutes[firstChar] : str;
        const preRemainder = format.slice(cursor, match.index);
        patternSegments.push(preRemainder, group);
        cursor = match.index + len;
      });

      if (cursor < format.length) {
        const remainder = format.slice(cursor, format.length);
        patternSegments.push(remainder);
      }

      return patternSegments.join("");
    },
    parseDate(date) {
      if (!date) return null;

      const res = matchMaskPattern(date, this.maskPattern);
      if (!res) return null;

      const [match, order] = res;
      const now = new Date();

      const getOrDefault = (identifier, defaultSupplier) => {
        const idx = order.indexOf(identifier);
        return idx >= 0 ? Number(match[idx + 1]) : defaultSupplier(); // order[i] = match[i + 1]
      };

      const year = getOrDefault("Y", () => now.getFullYear());
      const month = getOrDefault("m", () => now.getMonth() + 1);
      const day = getOrDefault("d", () => now.getDate());

      if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000 || year > 9999) return null; // invalid date
      // TODO check minDate, maxDate 

      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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
      const minDate = this.properties.minDate;
      if (!minDate) return undefined;

      if (minDate === "now") return this.currentDate();

      // parse date with date
      const date = Date.parse(minDate);
      return !isNaN(date) ? minDate : undefined;
    },
    maxDate() {
      const minDate = this.properties.minDate;
      if (!minDate) return undefined;

      if (minDate === "now") return this.currentDate();

      // parse date with date
      const date = Date.parse(minDate);
      return !isNaN(date) ? minDate : undefined;
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
    inputBridge: {
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