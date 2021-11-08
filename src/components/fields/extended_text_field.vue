<template>
  <v-text-field
    :autocomplete="autocomplete"
    @blur="blur"
    :clearable="clearable"
    clear-icon="mdi-close"
    @click="click"
    @click:clear="clear"
    :color="color"
    :counter="counter"
    :disabled="disabled"
    :messages="inputError"
    :filled="filled"
    :outlined="outlined"
    :solor="solo"
    @focus="focus"
    hide-details="auto"
    :id="id"
    :inputmode="inputmode"
    :label="label"
    :loading="loading"
    :name="name"
    :placeholder="placeholder"
    :prefix="prefix"
    v-model="inputValue"
    :readonly="readonly"
    :ref="'ref-' + id"
    :required="required"
    :rules="validateField"
    :suffix="suffix"
    :type="type"
    v-bind:class="
      ({
        'v-text-field--required': required,
        'v-text-field--optional': optional,
        'v-text-field--counting': counter,
        'v-text-field--updated': updated,
      },
      'ondigo-input',
      'ondigo-textfield',
      `ondigo-input-${id}`)
    "
    validate-on-blur
  >
    <template slot="prepend-outer"><slot name="prepend"></slot></template>
    <template slot="prepend-inner" v-if="optional"
      ><span class="v-input__label-optional">{{
        optionalLabel
      }}</span></template
    >
    <template slot="prepend-inner" v-if="required"
      ><span class="v-input__label-required">{{
        requiredLabel
      }}</span></template
    >
    <template slot="append">
      <div
        @click="menu = !menu"
        v-if="isTouchDevice && !!$slots.info"
        class="v-input__info"
      >
        <v-icon color="primary">mdi-information-outline</v-icon>
      </div>
    </template>
    <template slot="append-outer"><slot name="append"></slot></template>
  </v-text-field>
</template>

<script>
import utils from "../../plugins/utils";
import { createValidatorList, isRequired } from "../../lib/util";

export default {
  name: "OnTextfieldText",
  props: {
    autocomplete: {
      type: String,
      default: null,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "text",
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
    filled: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    solo: {
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
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    defaultValue: {
      type: String,
      required: false,
    },
    inputmode: {
      type: String,
      default: "text",
    },
    label: {
      type: String,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
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
    suffix: {
      type: String,
      default: null,
    },
    validators: {
      type: Array,
      required: false,
    },
    properties: {
      type: Object | Array,
      required: true,
    },
  },

  data() {
    return {
      menu: false,
      menuMaxHeight: 304,
      updated: false,
      dialog: null,
      dropDown: true,
      scrollPos: 0,
      isTouchDevice: utils.isTouchDevice(),
      windowHeight: window.innerHeight,
    };
  },

  mounted() {
    this.dialog = this.$refs["ref-" + this.id].$el.closest(".v-dialog");

    if (this.isTouchDevice) {
      window.addEventListener("orientationchange", this.onResize);
    } else {
      window.addEventListener("resize", this.onResize);
    }

    if (!!this.dialog) {
      this.scrollPos = this.dialog.scrollTop;
      this.dialog.addEventListener("scroll", this.onScroll, true);
    }
  },

  beforeDestroy() {
    if (this.isTouchDevice) {
      window.removeEventListener("orientationchange", this.onResize);
    } else {
      window.removeEventListener("resize", this.onResize);
    }

    if (!!this.dialog) {
      this.dialog.removeEventListener("scroll", this.onScroll);
    }
  },

  watch: {
    focused(focused) {
      // set focus to input tag
      if (focused) {
        this.$refs["ref-" + this.id].$refs.input.focus();

        if (!this.readonly && !this.isTouchDevice) {
          this.menu = true;
        }
      } else {
        this.$refs["ref-" + this.id].$refs.input.blur();
        this.menu = false;
      }
    },
  },

  computed: {
    required() {
      return isRequired(this.properties);
    },
    requiredLabel() {
      if (!this.validators || !this.validators.length) return "required";
      const notEmptyValidator = this.validators.find(
        (v) => v.identifier === "NotEmpty"
      );
      return (
        (notEmptyValidator && notEmptyValidator.errorMessage) || "required"
      );
    },
    validateField() {
      let r = {};
      const validate = [];

      // default validation
      if (!!this.required) {
        r.required = (v) => !!v;
      }

      const propsValidationMap = createValidatorList(this.validators);

      // combine default validation and custom validation
      r = Object.assign(r, propsValidationMap);

      // create array for text-field syntax
      for (const key of Object.keys(r)) {
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
    inputError() {
      return this.$store.getters.getCurrentInputError(this.id) || "";
    },
  },

  methods: {
    blur(e) {
      this.$emit("blur", e);

      this.$refs["ref-" + this.id].blur();
      this.menu = false;
    },
    change(e) {
      this.$emit("change", e);
    },
    clear(e) {
      this.$emit("clear", e);
      this.blur(e);
    },
    click(e) {
      this.$emit("click", e);
    },
    focus(e) {
      this.$emit("focus", e);
      this.windowHeight = window.innerHeight;

      if (!this.readonly && !this.isTouchDevice) {
        this.setMenuMaxHeight();
        this.menu = true;
      }
    },
    input(e) {
      this.$emit("input", e);
    },
    onResize() {
      this.setMenuMaxHeight();
    },
    onScroll() {
      // remove focus only if menu exisits
      if (!!this.$slots.info) {
        // only need to close menu if in overlay (do not attach!)
        if (this.menu && !!this.dialog) {
          if (
            this.dialog.scrollTop > this.scrollPos + 50 ||
            this.dialog.scrollTop < this.scrollPos - 50
          ) {
            this.$refs["ref-" + this.id].blur();
            this.menu = false;
          }
        }
      }
    },
    setMenuMaxHeight() {
      let keyboardHeight = this.isTouchDevice
          ? this.windowHeight / 2
          : this.windowHeight, // assumed keyboard height
        fieldHeight = this.$refs["ref-" + this.id].$el.clientHeight,
        maxHeight = this.menuMaxHeight,
        offset = 10;

      if (
        this.$refs["ref-" + this.id].$el.getBoundingClientRect().top +
          fieldHeight +
          100 <
        keyboardHeight
      ) {
        this.dropDown = true;
        maxHeight =
          keyboardHeight -
          this.$refs["ref-" + this.id].$el.getBoundingClientRect().top -
          fieldHeight -
          offset;
      } else {
        this.dropDown = false;
        maxHeight =
          this.$refs["ref-" + this.id].$el.getBoundingClientRect().top - offset;
      }

      this.menuMaxHeight = maxHeight;
    },
    update() {
      let _scope = this;
      this.updated = true;

      setTimeout(function () {
        _scope.updated = false;
      }, 1500);
    },
  },
};
</script>
