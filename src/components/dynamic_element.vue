<template>
  <component
    v-if="componentsMap[element.type]"
    :is="componentsMap[element.type]"
    v-bind="{ ...element, ...fieldPropsOverwrite }"
    :id="element.identifier"
    :formName="formName"
  />
  <fallback-field
    v-else-if="element.type !== 'Hidden'"
    :type="element.type"
  />
</template>

<script>
import FallbackField from "./fields/fallback_field.vue";
export default {
  components: { "fallback-field": FallbackField },
  name: "d-component",
  props: {
    element: {
      type: Object,
      required: true,
    },
    formName: {
      type: String,
      required: true,
    },
  },
  inject: ["componentsMap", "fieldPropsOverwrite"],
};
</script>
