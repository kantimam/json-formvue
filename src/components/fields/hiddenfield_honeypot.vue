<template>
  <div>
    <input
      type="text"
      :name="name"
      :style="{
        position: 'absolute',
        margin: '0 0 0 -999em',
      }"
      autocomplete="chrome-off"
      tabindex="-1"
      aria-hidden="true"
    />
  </div>
</template>

<script>
export default {
  props: {
    identifier: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
</style>
