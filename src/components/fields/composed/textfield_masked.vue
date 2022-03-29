<template>
  <!-- Inspired by https://github.com/rafaelkendrik/imask-vuetify/blob/4b02dffc656c18926df374e3522c6446b1e86c51/components/html/ImaskField.vue -->
  <v-text-field
      ref="field"
      v-model="inputValue"
      :autocomplete="properties['autoComplete']"
      @input="input"
      @focus="focus"
      @blur="blur"
      v-bind="$attrs"
      :placeholder="placeholder"
      :filled="filled"
      :required="isRequired"
      :rules="inputRules"
      :error-messages="inputError"
      validate-on-blur
  >
    <template slot="prepend-outer"><slot name="prepend"></slot></template>
    <template slot="prepend-inner" v-if="!isRequired">
      <span class="v-input__label-optional">
        {{ optionalLabel }}
      </span>
    </template>
    <template slot="prepend-inner" v-if="isRequired">
      <span class="v-input__label-required">
        {{ requiredLabel }}
      </span>
    </template>
    <template slot="append">
      <slot name="append-masked">
        <div
            @click="menu = !menu"
            v-if="isTouchDevice && !!$slots.info"
            class="v-input__info"
        >
          <v-icon color="primary">mdi-information-outline</v-icon>
        </div>
      </slot>
    </template>
    <template slot="append-outer"><slot name="append"></slot></template>
  </v-text-field>
</template>
<script lang="ts">
import 'reflect-metadata' // infer vue prop type validation by ts-definition; import this before vue-property-decorator!
import IMask from "@ondigo-internal/imask";
import utils from "../../../plugins/utils";
import {createInputRules, getPlaceholder, isRequired} from "@/lib/util";
import {Component, Inject, Prop, Vue} from "vue-property-decorator";
import {mixins} from "vue-class-component";
import InputValueMixin from "@/components/mixin/InputValueMixin";
import {ElementProperties, InputValidator} from "@/lib/FormDefinition";
import {ValidatorMap} from "@/lib/validators";

@Component<OnTextFieldMasked>({
  name: "OnTextfieldMasked",
  watch: {
    inputBridge(val) {
      if (!this.maskActive || (!this.isRequired && val.length <= 0)) return;

      if (!this.masked || !this.element)
        this.initMask();

      if (this.element) {
        this.element.value = val;
        this.element.dispatchEvent(new Event("input"));
      }
    }
  }
})
export default class OnTextFieldMasked extends mixins(InputValueMixin) {
  @Prop({
    default: () => []
  })
  readonly validators!: InputValidator[]

  @Prop()
  readonly properties!: ElementProperties

  @Prop()
  readonly identifier!: string

  @Prop({
    default: () => false
  })
  readonly filled!: boolean;

  @Prop({
    default: () => {}
  })
  readonly rules!: any[];

  @Prop({
    default: () => false
  })
  readonly optional!: boolean;

  @Prop({
    default: () => 'optional'
  })
  readonly optionalLabel!: string;

  @Prop({
    default: () => true
  })
  readonly maskActive!: boolean;

  @Prop({
    required: false
  })
  inputBridge?: string

  @Inject('validatorsMap')
  readonly validatorsMap!: ValidatorMap

  readonly $refs!: Partial<Record<string, HTMLElement>>

  element: HTMLInputElement | null = null;
  masked: IMask.InputMask<IMask.MaskedDateOptions | IMask.MaskedPatternOptions | IMask.MaskedRangeOptions> | null = null;
  isTouchDevice = utils.isTouchDevice();

  get isRequired() {
    return isRequired(this.properties);
  }

  get placeholder() {
    return getPlaceholder(this.properties);
  }

  get requiredLabel() {
    if (!this.validators || !this.validators.length) return "required";
    const notEmptyValidator = this.validators.find(v => v.identifier === "NotEmpty");
    return (notEmptyValidator && notEmptyValidator.errorMessage) || "required";
  }

  get inputRules() {
    if (this.rules && Array.isArray(this.rules)) return this.rules;
    else return createInputRules(this.isRequired, this.validators, this.properties, true, this.validatorsMap);
  }

  get inputValue() {
    return this.$store.getters.getCurrentInputValue(this.identifier) || '';
  }

  set inputValue(value: any) {
    this.$store.commit("updateInputValue", {
      key: this.identifier,
      value: value
    });
  }

  get inputError() {
    return this.$store.getters.getCurrentInputError(this.identifier) || "";
  }

  get mask() {
    const mask: IMask.AnyMaskedOptions = {
      mask: this.properties.pattern,
      // custom character definitions
      definitions: {
        X: /[0-9a-zA-Z]/,
        C: /[A-Z]/,
        c: /[a-z]/,
      },
      // custom character block definitions
      blocks: {
        YYYY: {
          mask: IMask.MaskedRange,
          from: 1900,
          to: 9999,
          autofix: true,
        },
        mm: {
          mask: IMask.MaskedRange,
          from: 1,
          to: 12,
          autofix: true,
        },
        dd: {
          mask: IMask.MaskedRange,
          from: 1,
          to: 31,
          autofix: true,
        },
        HH: {
          mask: IMask.MaskedRange,
          from: 0,
          to: 23,
          autofix: true,
        },
        ii: {
          mask: IMask.MaskedRange,
          from: 0,
          to: 59,
          autofix: true,
        },
      },
    };

    let placeholderChar = this.properties.placeholder ? this.properties.placeholder.trim() : "";
    if (placeholderChar && placeholderChar.length > 0) {
      placeholderChar = placeholderChar.substring(0, 1); // in case someone put more than one character
      mask.placeholderChar = placeholderChar;
      mask.lazy = false;
    }

    return mask;
  }

  mounted() {
    this.initElement();

    // when a default value is set, init mask manually
    if (this.maskActive && this.inputValue && this.inputValue.length > 0)
      this.initMask();
  }

  initElement() {
    this.element = (<Vue | undefined> this.$refs.field)?.$el.querySelector("input") || null;
  }

  initMask() {
    if (!this.maskActive || !this.element) return;

    if (this.masked && this.masked.destroy) this.destroyMask();

    this.masked = IMask(this.element, this.mask);
  }

  destroyMask() {
    this.masked?.destroy();
    this.masked = null;
  }

  // Event listeners
  input(e: InputEvent) {
    this.$emit("input", e);
  }

  focus() {
    if (this.maskActive && this.element && this.element.value.length <= 0) {
      this.initMask();
      if (!this.masked) return;

      this.element.value = this.masked.value;
      this.element.dispatchEvent(new Event("input"));

      setTimeout(() => {
        if (!this.element) return;

        if (this.element.setSelectionRange) {
          this.element.setSelectionRange(0, 0);
        } else if ('createTextRange' in this.element) {
          const range = (this.element as any).createTextRange();
          range.collapse(true);
          range.moveEnd("character", 0);
          range.moveStart("character", 0);
          range.select();
        }
      }, 20);
    }
  }

  blur() {
    if (!this.maskActive || !this.element || !this.masked) return;

    const isNormalized = this.element.value === this.masked.value;
    if (!isNormalized) {
      this.element.value = this.masked.value;
      this.element.dispatchEvent(new Event("input"));
    }

    // Destroy mask, when element is not required, so that the element will look like before
    if (this.masked.unmaskedValue.length <= 0 && !this.isRequired) {
      this.destroyMask();
      this.element.value = "";
      this.element.dispatchEvent(new Event("input"));
    }
  }
};
</script>
