<template>
  <v-select
      :allow-overflow="false"
      :append-icon="appendicon || $vuetify.icons.values.dropdown"
      :autocomplete="autocomplete || 'chrome-off'"
      :error-messages="inputError"
      @blur="blur"
      @change="change"
      @click="click"
      @click:append="append"
      @click:clear="clear"
      :clearable="clearable"
      :clear-icon="clearicon || $vuetify.icons.values.clear"
      :color="color || $vuetify.theme.themes.light.primary"
      :disabled="disabled"
      @focus="focus"
      :hide-details="hidedetails"
      :id="id"
      @input="input"
      inputmode="none"
      :items="selectItems"
      item-text="label"
      item-value="value"
      :label="label"
      :loading="loading"
      :menu-props="{
      bottom: dropDown,
      contentClass: 'v-select__dropdown',
      maxHeight: menuMaxHeight,
      offsetY: true,
      tile: true,
      top: !dropDown,
      value: menu,
    }"
      :name="name"
      :no-data-text="nodatatext"
      :placeholder="placeholder"
      :prefix="prefix"
      :readonly="readonly"
      :ref="'ref-' + id"
      :required="required"
      :rules="inputRules"
      :suffix="suffix"
      v-bind:class="{
      'v-text-field--required': required,
      'v-text-field--optional': optional,
      'v-text-field--updated': updated,
    }"
      v-model="inputValue"
      validate-on-blur
      :value="defaultValue"
  >
    <template slot="prepend-outer" v-if="!!$slots.prepend"
    ><slot name="prepend"></slot
    ></template>
    <template slot="prepend-item" v-if="!!$slots.info"
    ><div class="v-select__dropdown-info"><slot name="info"></slot></div
    ></template>
    <template slot="prepend-inner" v-if="required"
    ><span class="v-input__label-required">{{
        requiredLabel
      }}</span></template
    >
    <template slot="append-item"
    ><span class="v-select__shadow"></span
    ></template>
    <template slot="append-outer" v-if="!!$slots.append"
    ><slot name="append"></slot
    ></template>
  </v-select>
</template>

<script>
import {
  VSelect,
  VListItemTitle,
  VListItemContent,
  VListItemSubtitle,
} from "vuetify/lib";
import {
  createInputRules,
  isRequired,
  createRequiredLabel,
} from "../../lib/util";

export default {
  name: "OnSelect",

  components: {
    VSelect,
    VListItemTitle,
    VListItemContent,
    VListItemSubtitle,
  },

  props: {
    defaultValue: {
      type: String,
      required: false,
    },
    appendicon: {
      type: String,
      default: null,
    },
    autocomplete: {
      type: String,
      default: null,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    clearicon: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
    disabled: {
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

    label: {
      type: String,
      default: null,
    },
    lazyMaxHeight: {
      type: Number,
      default: 800,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    nodatatext: {
      type: String,
      default: "No Data available",
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
    suffix: {
      type: String,
      default: null,
    },
    validators: {
      type: Array,
      required: false,
    },
  },

  data() {
    return {
      menu: false,
      markWidth: 0,
      menuMaxHeight: 304,
      updated: false,
      dropDown: true,
      dialog: null,
      scrollPos: 0,
      windowHeight: window.innerHeight,
    };
  },

  watch: {
    focused(focused) {
      // set focus to input tag
      this.$nextTick(() => {
        if (focused) {
          this.$refs["ref-" + this.id].focus();

          if (!this.readonly) {
            this.setMenuMaxHeight();
            this.$refs["ref-" + this.id].activateMenu();
          }
        } else {
          this.$refs["ref-" + this.id].blur();
          this.menu = false;
        }
      });
    },
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
    inputError() {
      return this.$store.getters.getCurrentInputError(this.id) || "";
    },
    selectItems() {
      const optionsArray = [];
      if (!this.properties || !this.properties.options) return optionsArray;

      const options = this.properties.options;
      for (const prop in options) {
        optionsArray.push({
          value: prop,
          label: options[prop],
        });
      }

      return optionsArray;
    },
  },

  methods: {
    append() {
      if (this.menu) {
        this.$refs["ref-" + this.id].blur();
        this.menu = false;
      } else {
        this.$refs["ref-" + this.id].focus();

        if (!this.readonly) {
          this.setMenuMaxHeight();
          this.$refs["ref-" + this.id].activateMenu();
        }
      }
    },
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

      if (!this.readonly) {
        this.setMenuMaxHeight();
        this.menu = true;
      }
    },
    input(e) {
      this.$emit("input", e);
      this.blur(e);
    },
    onResize() {
      this.setMenuMaxHeight();
    },
    onScroll() {
      // only need to close menu if in overlay (do not attach!)
      if (this.menu && !!this.dialog) {
        if (
            this.dialog.scrollTop > this.scrollPos + 25 ||
            this.dialog.scrollTop < this.scrollPos - 25
        ) {
          this.$refs["ref-" + this.id].blur();
          this.menu = false;
        }
      }
    },
    setMenuMaxHeight() {
      let fieldHeight = this.$refs["ref-" + this.id].$el.clientHeight,
          maxHeight =
              this.menuMaxHeight <= this.lazyMaxHeight
                  ? this.menuMaxHeight
                  : this.lazyMaxHeight,
          offset = 10;

      if (
          this.$refs["ref-" + this.id].$el.getBoundingClientRect().top +
          fieldHeight +
          100 <
          this.windowHeight
      ) {
        this.dropDown = true;
        maxHeight =
            this.windowHeight -
            this.$refs["ref-" + this.id].$el.getBoundingClientRect().top -
            fieldHeight -
            offset;
      } else {
        this.dropDown = false;
        maxHeight =
            this.$refs["ref-" + this.id].$el.getBoundingClientRect().top - offset;
      }

      this.menuMaxHeight =
          maxHeight <= this.lazyMaxHeight ? maxHeight : this.lazyMaxHeight;
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
