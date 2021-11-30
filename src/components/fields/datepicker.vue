<template>
  <div>
    <input type="hidden" :name="name" v-model="formattedInput" />
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
          :class="`ondigo-input ondigo-textfield ondigo-input-${id}`"
          :inputBridge="inputBridge"
          v-bind="{
            ...$attrs,
            name: undefined,
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
        :locale="locale || navigator.language || 'en-US'"
      />
    </v-menu>
  </div>
</template>

<script>
import {
  getMaskPatternToRegexMatches,
  matchMaskPattern,
} from "../../lib/pattern";
import {
  createInputRules,
  isRequired,
  getPlaceholder,
} from "../../lib/util";
import MaskedText from "./textfield_masked.vue";
import { toIsoFormatWithOffset } from '../../lib/time';

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
    },
    date() {
      this.inputBridge = this.formatDate(this.date);
    },
    inputBridge(val) {
      const parsed = this.parseDate(val);
      if (parsed && parsed !== this.date) this.date = parsed;

      const time = Date.parse(parsed);
      if (isNaN(time)) return;

      this.formattedInput = toIsoFormatWithOffset(new Date(time));
    },
  },
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
    /**
     * @param {string} dateString The date string to split
     * @returns {string[]} The date components
     */
    splitDate(dateString) {
      return dateString.split("-").map((x) => Number(x));
    },
    /**
     * @param {string} date The date string of the date to check.
     * @param {number[]} maxDate A tuple of year, month and day.
     * @returns {boolean} True, if 'date' is before, or the same as 'maxDate'.
     */
    isBeforeOrSame(date, maxDate) {
      const [cYear, cMonth, cDay] = this.splitDate(date);

      return maxDate[0] <= cYear && maxDate[1] <= cMonth && maxDate[2] <= cDay;
    },
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = this.splitDate(date);
      const now = new Date();
      const substitutes = {
        d: String(day).padStart(2, '0'),
        m: String(month).padStart(2, '0'),
        Y: year,
        H: String(now.getHours()).padStart(2, '0'),
        i: String(now.getMinutes()).padStart(2, '0'),
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

      if (
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31 ||
        year < 1000 ||
        year > 9999
      )
        return null; // invalid date

      if (
        (this.minDate &&
          this.isBeforeOrSame(this.minDate, [year, month, day])) ||
        (this.maxDate && !this.isBeforeOrSame(this.maxDate, [year, month, day]))
      ) {
        return null; // date out of selectable range
      }

      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
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
      const minDate = this.properties.maxDate;
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
    locale() {
      return this.$store.getters.getCurrentSchema?.i18n;
    },
    inputRules() {
      return createInputRules(this.required, this.validators, this.properties);
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