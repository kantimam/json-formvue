<template>
  <v-col
    cols="12"
    :xl="columnSizes.lg"
    :lg="columnSizes.lg"
    :md="columnSizes.md"
    :sm="columnSizes.sm"
    :xs="columnSizes.xs"
  >
      <field-renderer 
        :fieldData="{...$props, ...$attrs}"
        :formName="formName"
      />
  </v-col>
</template>

<script>
import {VCol} from "vuetify/lib";

export default {
    name: 'column-field',
    components: {
        VCol,
    },
    props: {
        formName:{
            type: String,
            required: true
        },
        properties: {
            type: Object | Array ,
            required: true
        }
    },
    computed: {
        columnSizes(){
            const validSizeOrFullWidth=(sizeKey)=>{
                const defaultSize=12; // 12 columns the entire container

                const gridColumnConfigObj=this.properties.gridColumnClassAutoConfiguration;
                if(!gridColumnConfigObj) return defaultSize;

                const viewportsObj=gridColumnConfigObj.viewPorts;
                if(!viewportsObj) return defaultSize;
                
                const sizeObj=viewportsObj[sizeKey];
                if(!sizeObj) return defaultSize;
                
                const size=sizeObj.numbersOfColumnsToUse
                if(!size || isNaN(size) || size<1 || size>12){
                    return defaultSize;
                }
                return size;
            }
            
            if(typeof this.properties === 'object'){
                return {
                    lg: validSizeOrFullWidth('lg'),
                    md: validSizeOrFullWidth('md'),
                    sm: validSizeOrFullWidth('sm'),
                    xs: validSizeOrFullWidth('xs'),
                } 
                
            }

            return {
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12,
            }
        }
    },
  
}
</script>

<style>

</style>