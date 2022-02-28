<template>
  <div>
    <on-select v-bind="$attrs" v-on="$listeners" v-model="inputValue" multiple />
    <input 
      v-for="option in selectedOptions" 
      type="hidden"
      :key="option" 
      :name="name.concat('[]')" 
      :value="option" />
  </div>
</template>
<script>
import OnSelect from "./extended_select.vue";

export default {
  name: "OnMultiSelect",
  components: {
    OnSelect,
  },
  props: {
    properties: {
      type: Object,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  data: () => ({
    inputValue: []
  }),
  computed: {
    selectedOptions() {
      if(Array.isArray(this.properties.options)){
        return this.properties.options.filter(val => this.inputValue.includes(val));
      }
      return Object.keys(this.properties.options).filter(val => this.inputValue.includes(val));
    }
  }
};
</script>