

<template>
  <div v-if="properties && properties.gencaptchaUri" class="ondigo-captcha-container">
    <div class="ondigo-captcha-img-container">
      <img :src="data" alt="Captcha">
    </div>
    <div class="ondigo-captcha-refresh-container">
      <a 
        v-if="!loading"
        href="#"
        class="ondigo-captcha-refresh-text"
        @click="refresh">
        {{ properties.refreshText }}
      </a>
      <v-progress-circular
        v-else
        indeterminate
        size="20"
        width="3"
        color="primary" />
    </div>
    <div v-if="error" class="ondigo-captch-error">
      <p>
        {{ error }}
      </p>
    </div>
    <text-field v-bind="{...$props, ...$attrs}" v-on="$listeners" type="text" />
  </div>
  <div v-else class="ondigo-captch-error">
    <p>
      could not load Captcha try refreshing the page
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
  data: () => ({
    loading: false,
    error: null,
    data: null
  }),
  created: function() {
    this.preloadImage()
      .catch((err) => {
        console.error(err);
        this.error = 'Failed to fetch image.'
      });
  },
  methods: {
    refresh(event) {
      event.preventDefault();
      if (this.loading) return;

      this.loading = true;
      this.preloadImage()
        .then(() => this.loading = false)
        .catch(() => {
          this.error = 'Failed to fetch image.';
          this.loading = false;
      });
    },
    async preloadImage() {
      const response = await fetch(this.properties.gencaptchaUri);
      this.data = URL.createObjectURL(await response.blob());
    },
  },
  props: {
    properties: {
      type: Object | Array,
      required: false
    }
  }
}
</script>
