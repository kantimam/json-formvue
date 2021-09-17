<template>
  <input
      style="border: 1px solid red"
      placeholder="default input"
      v-bind="{...$attrs, ...$props}"
      v-on="$listeners"
      type="text" class="test-input"
      v-model="inputValue"
  >
</template>

<script>
export default {
  name: "testField",
  props: {
    id: String
  },
  computed: {
    inputValue: {
      get(){
        return this.$store.getters.getCurrentInputValue(this.id) || ""
      },
      set(value){
        this.$store.commit('updateInputValue', {key: this.id, value: value})
      }
    }
  }

}
</script>
