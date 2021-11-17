<template>
  <masked-text v-bind="$attrs" :mask-active="maskActive" v-on="$listeners" />
</template>
<script>
import MaskedText from "./textfield_masked.vue";
export default {
  name: "OnTextfieldTelephone",
  components: {
    MaskedText,
  },
  props: {
    properties: {
      type: Object | Array,
      required: true,
    },
  },
  computed: {
    maskActive() {
      return !!this.properties.pattern && this.properties.pattern.length > 0;
    }
  }
};
</script>