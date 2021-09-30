<template>
  <text-field v-bind="$attrs" v-on="$listeners" type="email"/>
</template>
<script>
  import TextField from './extended_text_field'
  export default {
  name: "OnTextfieldText",
  components: {
    TextField
  },
};
</script>
