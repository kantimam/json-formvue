<template>
  <v-select
      :allow-overflow="true"
      :append-icon="appendicon || $vuetify.icons.values.dropdown"
      :autocomplete="autocomplete || 'chrome-off'"
      attach
      :error-messages="inputError"
      :identifier="identifier"
      @blur="blur"
      @change="change"
      @click="click"
      @click:append="append"
      @click:clear="clear"
      :clearable="clearable"
      :clear-icon="clearicon || $vuetify.icons.values.clear"
      :color="color || $vuetify.theme.themes.light.primary"
      :disabled="disabled"
      :filled="filled"
      :outlined="outlined"
      :solo="solo"
      @focus="focus"
      :hide-details="hidedetails"
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
        top: !dropDown
      }"
      :name="multiple ? undefined : name"
      :no-data-text="nodatatext"
      :placeholder="placeholder"
      :prefix="prefix"
      :readonly="readonly"
      :ref="'ref-' + identifier"
      :required="required"
      :rules="inputRules"
      :suffix="suffix"
      v-bind:class="[{
      'v-text-field--required': required,
      'v-text-field--optional': !required,
      'v-text-field--updated': updated,
    }, `select-${identifier}`]"
      v-model="inputValue"
      validate-on-blur
      :value="defaultValue"
      :multiple="multiple"
  >
    <template v-if="customSelectionKeys && Array.isArray(customSelectionKeys)" v-slot:selection="{ item, index }">
      <template v-for="key in customSelectionKeys" >
        <span :class="[`custom-selection custom-selection-${key}`]" v-if="item.hasOwnProperty(key)">
          {{ item[key] }}
        </span>
      </template>
    </template>
    <template slot="prepend-outer" v-if="!!$slots.prepend"
    ><slot name="prepend"></slot
    ></template>
    <template slot="prepend-item" v-if="!!$slots.info"
    ><div class="v-select__dropdown-info"><slot name="info"></slot></div
    ></template>
    <template slot="prepend-inner" v-if="!required">
		<span class="v-input__label-optional">
			{{optionalLabel }}
		</span>
    </template>
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
import {VListItemContent, VListItemSubtitle, VListItemTitle, VSelect,} from "vuetify/lib";
import {createInputRules, createRequiredLabel, isRequired,} from "../../lib/util";

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
      type: [String, Number],
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
    identifier: {
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
    multiple: {
      type: Boolean,
      default: false
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
          this.$refs["ref-" + this.identifier].focus();

          if (!this.readonly) {
            this.setMenuMaxHeight();
            this.$refs["ref-" + this.identifier].activateMenu();
          }
        } else {
          this.$refs["ref-" + this.identifier].blur();
        }
      });
    },
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

  computed: {
    required() {
      return isRequired(this.properties);
    },
    requiredLabel() {
      return createRequiredLabel(this.validators);
    },
    inputRules() {
      return createInputRules(this.required, this.validators, this.properties, true);
    },
    inputValue: {
      get() {
        return this.$store.getters.getCurrentInputValue(this.identifier) || "";
      },
      set(value) {
        this.$store.commit("updateInputValue", { key: this.identifier, value: value });
      },
    },
    inputError() {
      return this.$store.getters.getCurrentInputError(this.identifier) || "";
    },
    selectItems() {
      if(Array.isArray(this.properties.options)){
        return this.properties.options;
      }

      const optionsArray = [];

      if(typeof this.properties.options === 'object'){
        if (!this.properties || !this.properties.options) return optionsArray;

        const options = this.properties.options;
        for (const prop in options) {
          optionsArray.push({
            value: prop,
            label: options[prop],
          });
        }

        return optionsArray;
      }

      return optionsArray;

    },
    customSelectionKeys(){
      if(this.properties?.customSelectionKeys){
        if(Array.isArray(this.properties.customSelectionKeys)){
          return this.properties.customSelectionKeys;
        }
        if(typeof this.properties.customSelectionKeys === 'string'){
          return [this.properties?.customSelectionKeys];
        }
      }
    }
  },

  methods: {
    append() {
      if (this.$refs["ref-" + this.identifier].isMenuActive) {
        this.$refs["ref-" + this.identifier].blur();
      } else {
        this.$refs["ref-" + this.identifier].focus();

        if (!this.readonly) {
          this.setMenuMaxHeight();
          this.$refs["ref-" + this.identifier].activateMenu();
        }
      }
    },
    blur(e) {
      this.$emit("blur", e);

      this.$refs["ref-" + this.identifier].blur();
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
        this.$refs["ref-" + this.identifier]?.activateMenu();
      }
    },
    input(e) {
      this.$emit("input", e);
      if (!this.multiple) this.blur(e);
    },
    onResize() {
      this.setMenuMaxHeight();
    },
    onScroll() {
      // only need to close menu if in overlay (do not attach!)
      if (this.$refs["ref-" + this.identifier].isMenuActive && !!this.dialog) {
        if (
            this.dialog.scrollTop > this.scrollPos + 25 ||
            this.dialog.scrollTop < this.scrollPos - 25
        ) {
          this.$refs["ref-" + this.identifier].blur();
        }
      }
    },
    setMenuMaxHeight() {
      let fieldHeight = this.$refs["ref-" + this.identifier].$el.clientHeight,
          maxHeight =
              this.menuMaxHeight <= this.lazyMaxHeight
                  ? this.menuMaxHeight
                  : this.lazyMaxHeight,
          offset = 10;

      if (
          this.$refs["ref-" + this.identifier].$el.getBoundingClientRect().top +
          fieldHeight +
          100 <
          this.windowHeight
      ) {
        this.dropDown = true;
        maxHeight =
            this.windowHeight -
            this.$refs["ref-" + this.identifier].$el.getBoundingClientRect().top -
            fieldHeight -
            offset;
      } else {
        this.dropDown = false;
        maxHeight =
            this.$refs["ref-" + this.identifier].$el.getBoundingClientRect().top - offset;
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
