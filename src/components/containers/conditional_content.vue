<template>
  <div v-if="shouldRender()">
    <child-dynamic-element
      v-for="element in elements"
      :element="element"
      :key="element.identifier"
      :formName="formName"
    />
  </div>
</template>

<script>
import DynamicElement from "../dynamic_element.vue";
import { isRequired } from "../../lib/util";

export default {
  name: "ConditionalContent",
  components: {
    "child-dynamic-element": DynamicElement,
  },
  data: () => ({}),
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
    shouldRender() {
      const conditionApplies =
        this.properties.conditionValue === this.conditionalValue;
      return !!this.properties.invertCondition
        ? !conditionApplies
        : conditionApplies;
    },
  },
  props: {
    conditionalValue: {
      type: String | Boolean | Number,
      required: true,
    },
    focused: {
      type: Boolean,
      default: false,
    },
    formName: {
      type: String,
      required: true,
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