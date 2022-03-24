<template>
  <v-row :v-if="identifier && elements && elements.length>0" :identifier="identifier">
        <form-grid-col
            v-for="element in elements"
            v-bind:key="element.identifier"
            v-bind="element"
            :formName="formName"
        />
  </v-row>
</template>

<script>
import FormGridCol from "./form_grid_col.vue";

export default {
    components: {
        FormGridCol
    },
    props: {
        identifier: {
            type: String,
            required: true
        },
        elements: {
            type: Array,
            required: true
        },
        formName: {
            type: String,
            required: true
        }
    },

}
</script>

<style>

</style>
