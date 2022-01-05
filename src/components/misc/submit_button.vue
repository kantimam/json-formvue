<template>
  <v-btn
      :class="`ondigo-btn-submit ondigo-btn ${alignment}`"
      type="submit"
      :loading="loading"
      color="primary"
      v-bind="{...$attrs}"
  >
    {{ btnLabel }}
  </v-btn>
</template>

<script>
export default {
  name: "OnSubmitButton",
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    btnLabel: {
      type: String,
      default: 'Submit'
    },
    alignment: {
      type: String,
      default: 'left'
    }
  }
}
</script>
