

<template>
  <div v-if="properties && properties.gencaptchaUri" class="ondigo-captcha-container">
    <div class="ondigo-captcha-img-container">
      <img :src="properties.gencaptchaUri" >
    </div>
    <text-field v-bind="{...$props, ...$attrs}" v-on="$listeners" type="text" />
  </div>
  <div v-else class="ondigo-captch-error">
    <p>
      could not load  Captcha try refreshing the page
    </p>
  </div>
</template>

<script>
import TextField from './textfield_text.vue'
export default {
  name: "onCaptcha",
  components: {
    TextField
  },
  props: {
    properties: {
      type: Object | Array,
      required: false
    }
  }
}
</script>
