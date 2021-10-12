<template>
  <text-field v-bind="$attrs" v-on="$listeners" type="text"/>
</template>
<script>
import TextField from './extended_text_field.vue'
  export default {
  name: "OnTextfieldText",
  components: {
    TextField
  },
};
</script>
