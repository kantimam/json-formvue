<template>
  <p class="ondigo-linktext ondigo-field">
    <template v-for="(text) in textWithLink">
      <a
          :key="text"
          class="ondigo-linktext-link"
          v-if="text==='$$ondigo_link_replacer$$'"
          :href="properties.link" v-bind:target="properties.openInNewWindow? '_blank' : '_self'"
          v-bind:data-overlay="properties.openInOverlay=='true'? 1 : null"
      >
        {{properties.linkText}}
      </a>
      <span :key="text + '_2'" v-else-if="text">
        {{text}}
      </span>
    </template>
  </p>
</template>

<script>
export default {
  name: "LinkedText.vue",
  props: {
    properties: {
      type: Object | Array,
      required: true
    }
  },
  computed: {
    textWithLink(){
      const {text, linkText}=this.properties;
      const nonLinkTextParts=text.split(linkText);
      if(!nonLinkTextParts || nonLinkTextParts.length<2) return [text];
      for(let i=0; i<nonLinkTextParts.length; i++){
        if(i % 2){
          nonLinkTextParts.splice(i, 0, '$$ondigo_link_replacer$$')
        }
      }
      return nonLinkTextParts;
    }
  },

}
</script>


