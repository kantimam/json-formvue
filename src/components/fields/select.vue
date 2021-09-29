<template>
    <v-select
        :items="selectItems"
        item-text="label"
        item-value="value"
        :id="id"
        :label="label"
        :name="name"
        outlined
        dense
        :ref="'ref-' + id"
        :required="required"
        :rules="validateField"
        :value="defaultValue"
        v-model="inputValue"
        hide-details="auto"

    ></v-select>
</template>

<script>
  import {createValidatorList, isRequired} from '../../lib/util'

  export default {
  name: "OnRadio",
 
  props: {
    
    
    defaultValue: {
      type: String,
      required: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    focused: {
      type: Boolean,
      default: false
    },
    hidedetails: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
    },
    
    label: {
      type: String,
      default: null
    },
    
    properties: {
      type: Object | Array,
      required: true
    },
    
    rules: {
      type: [Object, Array],
      default() {
        return {} || [];
      }
    },
    value: {
      type: [String, Number],
      default: null
    },
    validators: {
      type: Array,
      required: false
    }
  },

  computed: {
    required(){
      return isRequired(this.properties);
    },
    validateField() {
      //if(!this.required) return []
      let r = {};
      const validate = [];

      const propsValidationMap=createValidatorList(this.validators)
      // combine default validation and custom validation
      r = Object.assign(r, this.rules, propsValidationMap);
      // create array for text-field syntax

      for (const key in r) {
        validate.push(r[key]);
      }

      return validate;
    },
    inputValue: {
      get(){
        return this.$store.getters.getCurrentInputValue(this.id) || ""
      },
      set(value){
        this.$store.commit('updateInputValue', {key: this.id, value: value})
      }
    },
    selectItems(){
        const optionsArray=[];
        if(!this.properties || !this.properties.options) return optionsArray;

        const options=this.properties.options;
        console.log(options)
        for(const prop in options){
            optionsArray.push({
                value: prop,
                label: options[prop]
            })
        }


        return optionsArray;
    }
  },
  

  methods: {
    change(e) {
      this.$emit("change", e);
    },
    input(e) {
      this.$emit("input", e);
    },
    focus(e) {
      this.$emit("focus", e);
    },
    blur(e) {
      this.$emit("blur", e);
    }
  }
};
</script>
