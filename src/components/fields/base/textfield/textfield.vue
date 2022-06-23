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
      :identifier="identifier"
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
      :ref="'ref-' + identifier"
      :required="required"
      :rules="rules"
      :suffix="suffix"
      :autocomplete="properties && properties['autoComplete']"
      v-bind:class="{
        'v-text-field--required': required,
        'v-text-field--optional': optional && !required,
        'v-text-field--counting': counter,
        'v-text-field--updated': updated,
      }"
      v-model="inputValue"
      validate-on-blur
  >
    <template slot="prepend-outer"><slot name="prepend"></slot></template>
    <template slot="prepend-inner" v-if="optional && !required"
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
      <slot name="append">
        <div
            @click="menu = !menu"
            v-if="isTouchDevice && !!$slots.info"
            class="v-input__info"
        >
          <v-icon color="primary">mdi-information-outline</v-icon>
        </div>
      </slot>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import utils from "@/plugins/utils";
import './textfield.scss';
import {Component, Vue} from 'vue-property-decorator';
import InputValueMixin from "@/components/mixin/InputValueMixin";
import {mixins} from "vue-class-component";

const Props = Vue.extend({
  props: {
    counter: {
      type: [Number, String],
      default: null,
      validator: function (value: any) {
        return /^\d+$/.test(value);
      },
    },
    properties: {
      type: [Object, Array],
      required: true,
    },
    errorMessages: {
      type: String,
      required: false
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
      default: true,
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
      type: String,
      required: false
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
    type: {
      type: String,
      default: 'text'
    },
    readonly: {
      type: Boolean,
      default: false
    }
  }
});

@Component<OnTextFieldBase>({
  name: 'OnTextFieldBase',
  watch: {
    focused(focused) {
      // set focus to input tag
      const input = (<any> this.$refs["ref-" + this.identifier]).$refs.input.blur();
      if (focused) {
        input?.focus();

        if (!this.readonly && !this.isTouchDevice) {
          this.menu = true;
        }
      } else {
        input?.blur();
        this.menu = false;
      }
    },
  },
})
export default class OnTextFieldBase extends mixins(Props, InputValueMixin) {
  readonly $refs!: Partial<Record<string, HTMLElement>>

  // data
  menu = false
  menuMaxHeight = 304
  updated = false
  dialog: Element | null = null
  dropDown = true
  scrollPos = 0
  isTouchDevice = utils.isTouchDevice()
  windowHeight = window.innerHeight

  // hooks
  mounted() {
    const ref = this.$refs["ref-" + this.identifier];
    const element = (<Vue | undefined>(ref as any))?.$el;
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

  // methods
  blur(e: Event) {
    this.$emit("blur", e);

    this.$refs["ref-" + this.identifier]?.blur();
    this.menu = false;
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

    if (!this.readonly && !this.isTouchDevice) {
      this.setMenuMaxHeight();
      this.menu = true;
    }
  }

  input(e: InputEvent) {
    this.$emit("input", e);
  }

  onResize() {
    this.setMenuMaxHeight();
  }

  onScroll() {
    // remove focus only if menu exisits
    if (!!this.$slots.info) {
      // only need to close menu if in overlay (do not attach!)
      if (this.menu && !!this.dialog) {
        if (
            this.dialog.scrollTop > this.scrollPos + 50 ||
            this.dialog.scrollTop < this.scrollPos - 50
        ) {
          this.$refs["ref-" + this.identifier]?.blur();
          this.menu = false;
        }
      }
    }
  }

  setMenuMaxHeight() {
    const ref = this.$refs["ref-" + this.identifier];
    const element = (<Vue | undefined>(ref as any))?.$el;
    if (!element) return;

    let keyboardHeight = this.isTouchDevice ? this.windowHeight / 2 : this.windowHeight, // assumed keyboard height
        fieldHeight = element.clientHeight,
        maxHeight: number,
        offset = 10;

    if (element.getBoundingClientRect().top + fieldHeight + 100 < keyboardHeight) {
      this.dropDown = true;
      maxHeight = keyboardHeight - element.getBoundingClientRect().top - fieldHeight - offset;
    } else {
      this.dropDown = false;
      maxHeight = element.getBoundingClientRect().top - offset;
    }

    this.menuMaxHeight = maxHeight;
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
