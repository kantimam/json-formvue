<template>
  <div>
    <v-radio-group
      :class="`ondigo-input-${id} ondigo-radio`"
      :label="label"
      :ref="'ref-' + id"
      :required="required"
      v-model="selected"
      hide-details="auto"
    >
      <v-radio
        v-for="option in radioOptions"
        :key="option.value"
        :name="name"
        :label="option.label"
        :value="option.value"
      ></v-radio>
    </v-radio-group>
    <field-renderer
      v-for="element in elements"
      :key="element.identifier"
      :fieldData="{ conditionalValue: selected, ...element }"
      :formName="formName"
    />
  </div>
</template>

<script>
import { isRequired } from "../../lib/util";

export default {
  name: "ConditionRadio",
  data: () => ({
    selected: ''
  }),
  methods: {
    save(date) {
      this.$refs.menu.save(date);
    },
  },
  props: {
    focused: {
      type: Boolean,
      default: false,
    },
    formName: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    label: {
      type: String,
      default: null,
    },
    properties: {
      type: Object | Array,
      required: true,
    },
    elements: {
      type: Array,
    },
    value: {
      type: [String, Number],
      default: null,
    },
    validators: {
      type: Array,
      required: false,
    },
  },

  computed: {
    required() {
      return isRequired(this.properties);
    },
    radioOptions(){
        const optionsArray=[];
        if(!this.properties || !this.properties.options) return optionsArray;

        const options=this.properties.options;
        for(const prop in options){
            optionsArray.push({
                value: prop,
                label: options[prop]
            });
        }
        return optionsArray;
    }
  },
};
</script>