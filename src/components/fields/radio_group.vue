<template>
    <v-radio-group
        @blur="blur"
        @change="change"
        @focus="focus"
        :id="id"
        @input="input"
        :label="label"
        :ref="'ref-' + id"
        :required="required"
        :rules="validateField"
        validate-on-blur
        :value="defaultValue"
        color="red"
        :name="name"
    >
        <v-radio
            v-for="option in radioOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
        ></v-radio>
    </v-radio-group>
</template>

<script>
  import {createValidatorList, isRequired} from '../../lib/util'

  export default {
  name: "OnRadio",
 
  props: {
    autocomplete: {
      type: String,
      default: null
    },
    clearable: {
      type: Boolean,
      default: false
    },
    clearicon: {
      type: String,
      default: null
    },
    color: {
      type: String,
      default: null
    },
    counter: {
      type: [Number, String],
      default: null,
      validator: function(value) {
        return /^\d+$/.test(value);
      }
    },
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
    inputmode: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    optional: {
      type: Boolean,
      default: false
    },
    optionalLabel: {
      type: String,
      default: 'optional'
    },
    placeholder: {
      type: String,
      default: null
    },
    prefix: {
      type: String,
      default: null
    },
    properties: {
      type: Object | Array,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    
    requiredLabel: {
      type: String,
      default: 'required'
    },
    rules: {
      type: [Object, Array],
      default() {
        return {} || [];
      }
    },
    type: {
      type: String,
      default: 'text'
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
    radioOptions(){
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