<template>
  <div v-if="shouldRender()">
    <field-renderer 
      v-for="element in elements"
      :key="element.identifier"
      :fieldData="element"
      :formName="formName" />
  </div>
</template>

<script>
import { isRequired } from "../../lib/util";

export default {
  name: "ConditionalContent",
  data: () => ({}),
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
    shouldRender() {
      const conditionApplies = this.properties.conditionValue === this.conditionalValue;
      return !!this.properties.invertCondition ? !conditionApplies : conditionApplies;
    }
  },
  props: {
    conditionalValue: {
      type: String | Boolean | Number,
      required: true
    },
    focused: {
      type: Boolean,
      default: false,
    },
    formName:{
        type: String,
        required: true
    },
    id: {
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
        type: Array
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
    inputValue: {
      get() {
        return this.$store.getters.getCurrentInputValue(this.id) || "";
      },
      set(value) {
        this.$store.commit("updateInputValue", { key: this.id, value: value });
      },
    },
  },
};
</script>