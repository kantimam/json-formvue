<template>
  <div>
    <input
      type="text"
      :name="name"
      :id="id"
      :autocomplete="id"
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
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  }
};
</script>

<style scoped>
</style>