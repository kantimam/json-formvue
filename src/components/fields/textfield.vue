<template>
  <v-text-field
      :type="type"
      @blur="blur"
      @change="change"
      clear-icon="mdi-close"
      @click="click"
      @click:clear="clear"
      :counter="counter"
      debounce="2000"
      :error-messages="errorMessages"
      @focus="focus"
      :hide-details="hidedetails"
      :disabled="disabled"
      :filled="filled"
      :outlined="outlined"
      :solor="solo"
      :inputmode="inputmode"
      @input="input"
      :label="label"
      :loading="loading"
      :name="name"
      :prefix="prefix"
      :value="value"
      :ref="'ref-' + identifier"
      :required="required"
      :rules="rules"
      :suffix="suffix"
      :autocomplete="properties['autoComplete']"
      v-bind:class="{
        'v-text-field--required': required,
        'v-text-field--optional': optional,
        'v-text-field--counting': counter,
        'v-text-field--updated': updated,
      }"
      validate-on-blur
  >
    <template slot="prepend-outer"><slot name="prepend"></slot></template>
    <template slot="prepend-inner" v-if="!required"
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

export default {
  name: "TextField",
  props: {
    counter: {
      type: [Number, String],
      default: null,
      validator: function (value) {
        return /^\d+$/.test(value);
      },
    },
    properties: {
      type: Object | Array,
      required: true,
    },
    errorMessages: {
      type: String | null,
    },
    focused: {
      type: Boolean,
      default: false,
    },
    identifier: {
      type: String,
      required: true,
    },
    hidedetails: {
      type: Boolean,
      default: false,
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
    name: {
      type: String,
      required: true,
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
    required: {
      type: Boolean,
      default: false
    },
    requiredLabel: {
      type: String | null
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
    value: {
      type: String | Number,
      default: ""
    },
    type: {
      value: String,
      default: 'text'
    }

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
    this.dialog = this.$refs["ref-" + this.identifier].$el.closest(".v-dialog");

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
        this.$refs["ref-" + this.identifier].$refs.input.focus();

        if (!this.readonly && !this.isTouchDevice) {
          this.menu = true;
        }
      } else {
        this.$refs["ref-" + this.identifier].$refs.input.blur();
        this.menu = false;
      }
    },
  },

  methods: {
    blur(e) {
      this.$emit("blur", e);

      this.$refs["ref-" + this.identifier].blur();
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
            this.$refs["ref-" + this.identifier].blur();
            this.menu = false;
          }
        }
      }
    },
    setMenuMaxHeight() {
      let keyboardHeight = this.isTouchDevice
              ? this.windowHeight / 2
              : this.windowHeight, // assumed keyboard height
          fieldHeight = this.$refs["ref-" + this.identifier].$el.clientHeight,
          maxHeight = this.menuMaxHeight,
          offset = 10;

      if (
          this.$refs["ref-" + this.identifier].$el.getBoundingClientRect().top +
          fieldHeight +
          100 <
          keyboardHeight
      ) {
        this.dropDown = true;
        maxHeight =
            keyboardHeight -
            this.$refs["ref-" + this.identifier].$el.getBoundingClientRect().top -
            fieldHeight -
            offset;
      } else {
        this.dropDown = false;
        maxHeight =
            this.$refs["ref-" + this.identifier].$el.getBoundingClientRect().top - offset;
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
>
