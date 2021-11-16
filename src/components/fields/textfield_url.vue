<template>
  <text-field v-bind="$attrs" v-on="$listeners" type="url" />
</template>
<script>
import TextField from "./extended_text_field.vue";
export default {
  name: "OnTextfieldUrl",
  components: {
    TextField,
  },
};
</script>