<template>
  <div>
    <input
      type="text"
      :name="name"
      :style="{
        position: 'absolute',
        margin: '0 0 0 -999em',
      }"
      tabindex="-1"
      aria-hidden="true"
    />
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
</style>
