<template>
  <v-select
      :allow-overflow="true"
      :append-icon="appendicon || $vuetify.icons.values.dropdown"
      :autocomplete="autocomplete || 'chrome-off'"
      attach
      :error-messages="errorMessages"
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
      :name="multiple ? undefined : name"
      :no-data-text="nodatatext"
      :placeholder="placeholder"
      :prefix="prefix"
      :readonly="readonly"
      :ref="'ref-' + identifier"
      :required="required"
      :rules="rules"
      :suffix="suffix"
      v-bind:class="[{
        'v-text-field--required': required,
        'v-text-field--optional': !required,
        'v-text-field--updated': updated,
      }, `select-${identifier}`]"
      :menu-props="{
        bottom: dropDown,
        contentClass: 'v-select__dropdown',
        maxHeight: menuMaxHeight,
        offsetY: true,
        tile: true,
        top: !dropDown,
      }"
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
    <template slot="prepend-outer" v-if="!!$slots.prepend">
      <slot name="prepend" />
    </template>
    <template slot="prepend-item" v-if="!!$slots.info">
      <div class="v-select__dropdown-info">
        <slot name="info" />
      </div>
    </template>
    <template slot="prepend-inner" v-if="!required">
		<span class="v-input__label-optional">
			{{optionalLabel }}
		</span>
    </template>
    <template slot="prepend-inner" v-if="required">
      <span class="v-input__label-required">
        {{ requiredLabel }}
      </span>
    </template>
    <template slot="append-item">
      <span class="v-select__shadow" />
    </template>
    <template slot="append-outer" v-if="!!$slots.append">
      <slot name="append" />
    </template>
  </v-select>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import utils from "@/plugins/utils";
import './select.scss';

const Props = Vue.extend({
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
      type: [Object, Array],
      required: true
    },
    rules: {
      type: Array,
      default() {
        return [];
      },
    },
    suffix: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false
    },
    requiredLabel: {
      type: String,
      required: false
    },
    errorMessages: {
      type: String,
      required: false
    },
  },
});

type SelectItem = {
  value: string,
  label: string
}

@Component<OnSelect>({
  name: "OnSelect",
  watch: {
    focused(focused) {
      // set focus to input tag
      this.$nextTick(() => {
        if (focused) {
          this.$refs["ref-" + this.identifier]?.focus();

          if (!this.readonly) {
            this.setMenuMaxHeight();
            (this.$refs["ref-" + this.identifier] as any)?.activateMenu();
          }
        } else {
          this.$refs["ref-" + this.identifier]?.blur();
        }
      });
    }
  },
})
export default class OnSelect extends Props {
  $refs!: Partial<Record<string, HTMLElement>>

  menu = false
  markWidth = 0
  menuMaxHeight = 304
  updated = false
  dropDown = true
  dialog: Element | null = null
  scrollPos = 0
  windowHeight = window.innerHeight
  isTouchDevice = utils.isTouchDevice()

  mounted() {
    const ref = this.$refs["ref-" + this.identifier];
    const element = <HTMLElement | undefined> (ref as any)?.element;
    this.dialog = element?.closest(".v-dialog") || null;

    if (this.isTouchDevice) {
      window.addEventListener("orientationchange", this.onResize);
    } else {
      window.addEventListener("resize", this.onResize);
    }

    if (!!this.dialog) {
      this.scrollPos = this.dialog.scrollTop;
      this.dialog.addEventListener("scroll", this.onScroll, true);
    }
  }

  beforeDestroy() {
    if (this.isTouchDevice) {
      window.removeEventListener("orientationchange", this.onResize);
    } else {
      window.removeEventListener("resize", this.onResize);
    }

    if (!!this.dialog) {
      this.dialog.removeEventListener("scroll", this.onScroll);
    }
  }

  get selectItems(): SelectItem[] {
    if(Array.isArray(this.properties.options)){
      return this.properties.options;
    }

    const optionsArray: SelectItem[] = [];

    if (typeof this.properties.options === 'object'){
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
  }

  get customSelectionKeys(): string[] | undefined {
    if (this.properties?.customSelectionKeys){
      if (Array.isArray(this.properties.customSelectionKeys)){
        return this.properties.customSelectionKeys;
      }
      if (typeof this.properties.customSelectionKeys === 'string'){
        return [this.properties.customSelectionKeys];
      }
    }

    return undefined;
  }

  append() {
    const ref = this.$refs["ref-" + this.identifier] as any;
    if (!ref) return;

    if (ref.isMenuActive) {
      ref?.blur();
    } else {
      ref?.focus();

      if (!this.readonly) {
        this.setMenuMaxHeight();
        (ref as any)?.activateMenu();
      }
    }
  }

  blur(e: Event | string) {
    this.$emit("blur", e);

    this.$refs["ref-" + this.identifier]?.blur();
  }

  change(e: Event) {
    this.$emit("change", e);
  }

  clear(e: Event) {
    this.$emit("clear", e);
    this.blur(e);
  }

  click(e: MouseEvent) {
    this.$emit("click", e);
  }

  focus(e: FocusEvent) {
    this.$emit("focus", e);
    this.windowHeight = window.innerHeight;

    if (!this.readonly) {
      this.setMenuMaxHeight();
      (this.$refs["ref-" + this.identifier] as any)?.activateMenu();
    }
  }

  input(e: InputEvent) {
    this.$emit("input", e);
    if (!this.multiple) this.blur(e);
  }

  onResize() {
    this.setMenuMaxHeight();
  }

  onScroll() {
    // only need to close menu if in overlay (do not attach!)
    if ((this.$refs["ref-" + this.identifier] as any)?.isMenuActive && !!this.dialog) {
      if (this.dialog.scrollTop > this.scrollPos + 25 || this.dialog.scrollTop < this.scrollPos - 25) {
        this.$refs["ref-" + this.identifier]?.blur();
      }
    }
  }

  setMenuMaxHeight() {
    const element = <HTMLElement | undefined> (this.$refs["ref-" + this.identifier] as any)?.$el;
    if (!element) return;

    const fieldHeight = element.clientHeight;
    let maxHeight: number;
    const offset = 10;

    if (element.getBoundingClientRect().top + fieldHeight + 100 < this.windowHeight) {
      this.dropDown = true;
      maxHeight = this.windowHeight - element.getBoundingClientRect().top - fieldHeight - offset;
    } else {
      this.dropDown = false;
      maxHeight = element.getBoundingClientRect().top - offset;
    }

    this.menuMaxHeight = maxHeight <= this.lazyMaxHeight ? maxHeight : this.lazyMaxHeight;
  }

  update() {
    let _scope = this;
    this.updated = true;

    setTimeout(function () {
      _scope.updated = false;
    }, 1500);
  }
};
</script>
