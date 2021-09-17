<template>
  <text-field v-bind="$attrs" v-on="$listeners" type="text"/>
</template>
<script>
  import TextField from './textfield.vue'
  export default {
  name: "OnTextfieldText",
  components: {
    TextField
  },
};
</script>
