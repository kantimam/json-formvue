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
            :placeholder="placeholder"
            ref="masked"
            :rules="menu ? [] : inputRules"
            :class="`ondigo-input ondigo-textfield ondigo-input-${identifier}`"
            :inputBridge="inputBridge"
            :identifier="identifier"
            :name="name"
            v-bind="{
              ...$attrs,
              defaultValue: formattedDefaultValue,
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

<script lang="ts">
import 'reflect-metadata' // infer vue prop type validation by ts-definition; import this before vue-property-decorator!
import {createInputRules, getPlaceholder, isRequired} from "@/lib/util";
import {Component, Inject, Prop, Vue} from "vue-property-decorator";
import {mixins} from "vue-class-component";
import InputValueMixin from "@/components/mixin/InputValueMixin";
import MaskedText from "@/components/fields/composed/textfield_masked.vue";

import {
  compareDateTimes,
  formatISODateFromPattern,
  getShortIsoString,
  interpretTime,
  isIsoFormatted,
  parseISODateFromPattern,
  toIsoFormatWithOffset
} from "@/lib/time";
import {ElementProperties, InputValidator} from "@/lib/FormDefinition";
import {ValidatorMap} from "@/lib/validators";

@Component<OnDatePicker>({
  name: "OnDatePicker",
  components: {
    MaskedText: MaskedText
  },
  watch: {
    menu(val) {
      val && setTimeout(() => (this.activePicker = "YEAR"));
      this.$store.commit("setFormDisabled", val);
    },
    date() {
      this.inputBridge = this.formatDate(this.date);
    },
    inputBridge(val) {
      this.updateFormattedValue(val);
    },
  }
})
export default class OnDatePicker extends mixins(InputValueMixin) {

  @Prop({
    default: () => []
  })
  readonly validators!: InputValidator[]

  @Prop()
  readonly properties!: ElementProperties

  @Prop()
  readonly identifier!: string

  @Prop()
  readonly defaultValue?: string;

  @Prop()
  readonly name!: string

  @Prop({
    default: () => {
    }
  })
  readonly rules!: any[];

  @Inject('validatorsMap')
  readonly validatorsMap!: ValidatorMap

  readonly $refs!: Partial<Record<string, HTMLElement>> & {
    field: Vue
  }

  activePicker: 'YEAR' | 'MONTH' | 'DATE' | null = null;
  date: string | null = null
  menu = false;
  formattedInput: string | null = null

  get inputRules() {
    if (this.rules && Array.isArray(this.rules)) return this.rules;
    else return createInputRules(this.isRequired, this.validators, {
      ...this.properties,
      pattern: this.maskPattern,
    }, true, this.validatorsMap);
  }

  get isRequired() {
    return isRequired(this.properties);
  }

  get placeholder() {
    return getPlaceholder(this.properties);
  }

  get maskActive() {
    return !!this.properties.enableMask;
  }

  get formattedDefaultValue() {
    if (!this.defaultValue || !this.maskPattern) return '';

    const date = new Date(this.defaultValue);
    const dateStr = getShortIsoString(date);

    const now = new Date();
    return formatISODateFromPattern(dateStr, this.maskPattern, {
      // additional mappings for hour, minute
      H: String(now.getHours()).padStart(2, "0"),
      i: String(now.getMinutes()).padStart(2, "0"),
    });
  }

  get minDate() {
    if (!this.validators) return undefined;

    const validator = this.validators.find(v => v.identifier === "DateInterval");
    if (!validator) return undefined;

    const minDate = validator.options?.minDate;
    if (!minDate) return undefined;

    const interpreted = interpretTime(minDate);

    // parse date with date
    const date = Date.parse(interpreted);
    return !isNaN(date) ? interpreted : undefined;
  }

  get maxDate() {
    if (!this.validators) return undefined;

    const validator = this.validators.find(v => v.identifier === "DateInterval");
    if (!validator) return undefined;

    const maxDate = validator.options?.maxDate;
    if (!maxDate) return undefined;

    const interpreted = interpretTime(maxDate);

    // parse date with date
    const date = Date.parse(interpreted);
    return !isNaN(date) ? interpreted : undefined;
  }

  get maskPattern() {
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
  }

  get locale() {
    return this.$store.getters.getCurrentSchema?.i18n;
  }

  get inputBridge() {
    return this.$store.getters.getCurrentInputValue(this.identifier) || "";
  }

  set inputBridge(value) {
    this.$store.commit("updateInputValue", {key: this.identifier, value: value});
  }

  created() {
    const stored = this.$store.getters.getCurrentInputValue(this.identifier);
    if (!stored) return;

    // when default values are set, they are in ISO format, but we need our masked format for this component.
    // fix it via the formattedDefaultValue property
    if (isIsoFormatted(stored)) {
      this.$store.commit("updateInputValue", {key: this.identifier, value: this.formattedDefaultValue});
    } else {
      this.updateFormattedValue(stored);
    }
  }

  save(date: string) {
    (<any>this.$refs.menu)?.save(date);
  }

  formatDate(date: string | null) {
    if (!date) return null;

    const now = new Date();
    return formatISODateFromPattern(date, this.maskPattern, {
      // additional mappings for hour, minute
      H: String(now.getHours()).padStart(2, "0"),
      i: String(now.getMinutes()).padStart(2, "0"),
    });
  }

  updateFormattedValue(val: string) {
    const parsed = this.parseDate(val);

    if (!parsed) return;

    if (parsed !== this.date) this.date = parsed;

    const time = Date.parse(parsed);
    if (isNaN(time)) {
      this.formattedInput = null;
      return;
    }

    this.formattedInput = toIsoFormatWithOffset(new Date(time));
  }

  parseDate(date: string) {
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
          if (!year || !month || !day ||
              month < 1 || month > 12 ||
              day < 1 || day > 31 ||
              year < 1000 || year > 9999) {
            return [null, true]; // invalid date, override with null
          }

          // check if date components are in given min/max range (to prevent vuetify error throw)
          const inputDate = [year, month, day] as [number, number, number];
          if (
              (this.minDate && compareDateTimes(inputDate, this.minDate) < 0) /* date is before minDate */ ||
              (this.maxDate && compareDateTimes(inputDate, this.maxDate) > 0) /* date is after maxDate */
          ) {
            return [null, true]; // date out of selectable range, override with null
          }
          return [null, false]; // do not override
        }
    );
  }
};
</script>
