<template>
  <v-textarea
      :autocomplete="properties['autoComplete']"
      auto-size
      :color="color"
      :counter="maxLength"
      :disabled="disabled"
      :filled="filled"
      :outlined="outlined"
      :solo="solo"
      hide-details="auto"
      :inputmode="inputmode"
      :label="label"
      :loading="loading"
      :error-messages="errorMessages"
      :name="name"
      :placeholder="placeholder"
      :prefix="prefix"
      :readonly="readonly"
      :ref="'ref-' + identifier"
      :required="required"
      :rules="rules"
      :suffix="suffix"
      :type="type"
      v-bind:class="
      [{
        'v-text-field--required': required,
        'v-text-field--optional': optional && !required,
        'v-text-field--counting': maxLength !== null,
        'v-text-field--updated': updated,
      },
      'ondigo-input',
      'ondigo-textarea',
      `ondigo-input-${identifier}`]
    "
      validate-on-blur
      @blur="blur"
      @focus="focus"
      @change="change"
      @input="input"
      v-model="inputValue"
  >
    <template slot="prepend-outer"><slot name="prepend"></slot></template>
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
    <template slot="append-outer"><slot name="append"></slot></template>
  </v-textarea>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import './textarea.scss';
import InputValueMixin from "@/components/mixin/InputValueMixin";
import {mixins} from "vue-class-component";

const Props = Vue.extend({
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
    readonly: {
      type: Boolean,
      default: false,
    },
    suffix: {
      type: String,
      default: null,
    },
    properties: {
      type: [Object, Array],
      required: true,
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
    errorMessages: {
      type: String,
      required: false
    },
    maxLength: {
      type: Number,
      default: null
    }
  }
});

@Component<OnTextareaBase>({
  name: "OnTextareaBase",
  watch: {
    focused(focused) {
      // set focus to input tag
      const input: HTMLElement | undefined = (<any> this.$refs["ref-" + this.identifier])?.$refs?.input;
      if (focused) {
        input?.focus();
      } else {
        input?.blur();
      }
    },
    loading(loading) {
      if (!loading) return;
    },
  }
})
export default class OnTextareaBase extends mixins(Props, InputValueMixin) {
  readonly $refs!: Partial<Record<string, HTMLElement>>

  updated = false

  blur(e: Event) {
    this.$emit("blur", e);
  }

  change(e: Event) {
    this.$emit("change", e);
  }

  focus(e: FocusEvent) {
    this.$emit("focus", e);
  }

  input(e: InputEvent) {
    this.$emit("input", e);
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
