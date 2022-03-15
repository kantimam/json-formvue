<template>
  <div class="ongigo-text-wrapper" v-bind="$attrs">
    <h2 class="ondigo-text-label">{{ label }}</h2>
    <p class="ondigo-text-content">{{ properties.text }}</p>
  </div>
</template>

<script>
export default {
  props: {
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
