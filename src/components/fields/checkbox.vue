<template>
  <v-checkbox
      class="ondigo-checkbox"
      :class="`o-input-${id} o-checkbox`"
      :label="label"
      :ref="'ref-' + id"
      :required="required"
      :rules="validateField"
      validate-on-blur
      v-model="inputValue"
      :value="inputValue"
      :checked="inputValue"
      :name="name"
  >
    <div v-if="properties.link" class="ondigo-label-wrapper" slot="label">
      <p class="ondigo-label-p">
        {{ label }}
        {{" "}}
        <a
            @click.stop
            class="ondigo-label-a"
            v-bind:target="properties.openInNewWindow? '_blank' : '_self'"
            v-bind:data-overlay="properties.openInOverlay=='true'? 1 : null"
            :href="properties.link"
        >
          {{ properties.linkText }}
        </a>
      </p>
    </div>
  </v-checkbox>
</template>

<script>

import {createValidatorList, isRequired} from '../../lib/util'

export default {
  name: "OnCheckbox",

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
        return this.$store.getters.getCurrentInputValue(this.id)? true : false
      },
      set(value){
        console.log(value)
        this.$store.commit('updateInputValue', {key: this.id, value: value})
      }
    }
  },

};
</script>
