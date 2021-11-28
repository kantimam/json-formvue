<template>
  <div class="fallback-field">
    could not find component for the key {{ type }}
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "unknown",
    },
  },
};
</script>
