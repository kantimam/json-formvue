<template>
  <v-checkbox
    :checked="inputValue"
    class="ondigo-checkbox"
    :class="`ondigo-input-${identifier} ondigo-checkbox`"
    :error-messages="errorMessages"
    :label="label"
    :identifier="identifier"
    :ref="'ref-' + identifier"
    :required="required"
    :rules="rules"
    validate-on-blur
    :name="name"
    hide-details="auto"
    off-icon="mdi-checkbox-blank"
    v-model="inputValue"
  >
    <div v-if="properties.content" ref="contentLabel" slot="label" class="ondigo-content-element-wrapper" v-html="properties.content" />
  </v-checkbox>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import {mixins} from "vue-class-component";
import InputValueMixin from "@/components/mixin/InputValueMixin";

const Props = Vue.extend({
  props: {
    identifier: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    label: {
      type: String,
      default: null,
    },
    properties: {
      type: [Object, Array],
      required: true,
    },
    requiredLabel: {
      type: String,
      default: "required",
    },
    type: {
      type: String,
      default: "text",
    },
    required: {
      type: Boolean,
      default: false
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
    }
  }
});

@Component<OnCheckboxBase>({
  name: "OnCheckboxBase",
})
export default class OnCheckboxBase extends mixins(Props, InputValueMixin) {
  readonly $refs!: Partial<Record<string, HTMLElement>>

  mounted() {
    const contentLabel = this.$refs['contentLabel'];
    if (contentLabel) {
      const links = Array.from(contentLabel.querySelectorAll('a'));
      links.forEach(elem => elem.addEventListener('click', e => e.stopPropagation()));
    }
  }
}
</script>


