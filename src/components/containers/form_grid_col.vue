<template>
  <v-col
    :xl="columnSizes.lg"
    :lg="columnSizes.lg"
    :md="columnSizes.md"
    :sm="columnSizes.sm"
    :cols="columnSizes.xs"
  >
    <child-dynamic-element
      :formName="formName"
      :element="{ ...$props, ...$attrs }"
    />
  </v-col>
</template>

<script>
import DynamicElement from "../dynamic_element.vue";
export default {
  name: "column-field",
  components: {
    "child-dynamic-element": DynamicElement,
  },
  props: {
    formName: {
      type: String,
      required: true,
    },
    properties: {
      type: Object | Array,
      required: true,
    },
  },
  computed: {
    columnSizes() {
      const validSizeOrFullWidth = (sizeKey) => {
        const defaultSize = 12; // 12 columns the entire container

        const gridColumnConfigObj =
          this.properties.gridColumnClassAutoConfiguration;
        if (!gridColumnConfigObj) return defaultSize;

        const viewportsObj = gridColumnConfigObj.viewPorts;
        if (!viewportsObj) return defaultSize;

        const sizeObj = viewportsObj[sizeKey];
        if (!sizeObj) return defaultSize;

        const size = sizeObj.numbersOfColumnsToUse;
        if (!size || isNaN(size) || size < 1 || size > 12) {
          return defaultSize;
        }
        return size;
      };

      if (typeof this.properties === "object") {
        return {
          lg: validSizeOrFullWidth("lg"),
          md: validSizeOrFullWidth("md"),
          sm: validSizeOrFullWidth("sm"),
          xs: validSizeOrFullWidth("xs"),
        };
      }

      return {
        lg: 12,
        md: 12,
        sm: 12,
        xs: 12,
      };
    },
  },
};
</script>

<style>
</style>
