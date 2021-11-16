<template>
  <text-field
    v-bind="{ ...$attrs, rules: rules }"
    v-on="$listeners"
    type="url"
  />
</template>
<script>
import TextField from "./extended_text_field.vue";
export default {
  name: "OnTextfieldUrl",
  components: {
    TextField,
  },
  props: {
    renderingOptions: {
      type: Object,
      default: {},
    },
  },
  data() {
    const urlErrorMessage = this.renderingOptions?.urlErrorMessage;
    return {
      rules: {
        url(value) {
          const pattern =
            /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
          return pattern.test(value) || urlErrorMessage || "Invalid URL";
        },
      },
    };
  },
};
</script>