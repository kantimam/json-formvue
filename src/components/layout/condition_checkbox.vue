<template>
  <div>
    <v-checkbox
      class="ondigo-checkbox"
      :class="`ondigo-input-${id} ondigo-checkbox`"
      :label="label"
      :ref="'ref-' + id"
      v-model="checked"
      hide-details="auto"
      off-icon="mdi-checkbox-blank"
    />
    <field-renderer 
      v-for="element in elements"
      :key="element.identifier"
      :fieldData="{ conditionalValue: checked, ...element }"
      :formName="formName" />
  </div>
</template>

<script>
import { isRequired } from "../../lib/util";

export default {
  name: "ConditionCheckbox",
  data: () => ({
    checked: false
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
  },
};
</script>