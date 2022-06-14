<template>
  <div class="on-row" :v-if="identifier && elements && elements.length>0">
        <form-grid-col 
            v-for="element in elements"
            v-bind:key="element.identifier"
            v-bind="element"
            :formName="formName"
        />
  </div>
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
  .on-row{
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex: 1 1 auto;
  }
</style>