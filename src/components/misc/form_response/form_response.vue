<template>
  <div
      v-if="isResponseObject && !isHtml"
      :class="`ondigo-response${isError ? ' ondigo-response-error error--text' : ''}`"
  >
    <h3 v-if="title">{{ title }}</h3>
    <p v-if="text">{{ text }}</p>
  </div>
  <div
      v-else
      :class="`ondigo-response${isError ? ' ondigo-response-error error--text' : ''}`"
      v-html="isResponseObject ? response.html : response"
  />

</template>

<script>
export default {
  name: "OnFormResponse",
  props: {
    response: {
      type: [Object, String],
      default: null
    },
    formName: {
      type: String,
      default: null
    }
  },
  computed: {
    isResponseObject() {
      return !!this.response && typeof this.response === 'object';
    },
    isHtml() {
      return this.isResponseObject && 'html' in this.response
    },
    isError() {
      return this.isResponseObject && 'error' in this.response ? !!this.response.error : false
    },
    title() {
      return this.isResponseObject ? this.response.title : null;
    },
    text() {
      return this.isResponseObject ? this.response.text : null;
    }
  }
}
</script>
