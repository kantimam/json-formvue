<template>
  <div>
    <radio-select v-model="inputValue" v-bind="$attrs" v-on="$listeners" />
    <field-renderer 
      v-for="element in renderables"
      :key="element.identifier"
      :fieldData="{ conditionalValue: inputValue, ...element }"
      :formName="formName" />
  </div>
</template>

<script>
import { isRequired } from "../../lib/util";
import RadioSelect from '../fields/radio_group.vue';

export default {
  name: "ConditionRadio",
  data: () => ({}),
  components: {
      RadioSelect
  },
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
    renderables: {
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