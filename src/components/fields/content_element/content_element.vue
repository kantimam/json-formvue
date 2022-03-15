<template>
  <div class="ondigo-content-element-wrapper" v-html="properties.content" />
</template>
<script>
export default {
  name: "ContentElement",
  props: {
    identifier: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: null,
    },
    properties: {
      type: Object | Array,
      required: true,
    },
  },
};
</script>
