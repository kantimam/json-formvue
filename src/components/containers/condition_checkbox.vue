<template>
  <div>
    <v-checkbox
      class="ondigo-checkbox"
      :class="`ondigo-input-${identifier} ondigo-checkbox`"
      :label="label"
      :ref="'ref-' + identifier"
      :name="name"
      v-model="checked"
      :value="checked ? true : false"
      hide-details="auto"
      off-icon="mdi-checkbox-blank"
    />

    <child-dynamic-element
      v-for="element in elements"
      :element="{ conditionalValue: checked, ...element }"
      :key="element.identifier"
      :formName="formName"
    />
  </div>
</template>

<script>
import DynamicElement from "../dynamic_element.vue";
import { isRequired } from "../../lib/util";

export default {
  name: "ConditionCheckbox",
  components: {
    "child-dynamic-element": DynamicElement,
  },
  data: () => ({
    checked: false,
  }),
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
  },
  props: {
    focused: {
      type: Boolean,
      default: false,
    },
    formName: {
      type: String,
      required: true,
    },
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
      type: Object | Array,
      required: true,
    },
    elements: {
      type: Array,
    },
    value: {
      type: [String, Number],
      default: null,
    },
    validators: {
      type: Array,
      required: false,
    },
  },

  computed: {
    required() {
      return isRequired(this.properties);
    },
  },
};
</script>
