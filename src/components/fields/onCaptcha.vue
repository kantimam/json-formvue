

<template>
  <div v-if="properties && properties.gencaptchaUri" class="ondigo-captcha-container">
    <div class="ondigo-captcha-img-container" ref="captchaImgContainer" />
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
  }),
  created: function() {
    this.preloadImage()
      .then(img => this.setImg(img))
      .catch(() => this.error = 'Failed to fetch image.');
  },
  methods: {
    refresh(event) {
      event.preventDefault();
      if (this.loading) return;

      this.loading = true;
      this.preloadImage()
        .then(img => {
          this.setImg(img);
          this.loading = false;
        })
        .catch(() => {
          this.error = 'Failed to fetch image.';
          this.loading = false;
        });
    },
    preloadImage() {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', err => reject(err));

        image.src = this.properties.gencaptchaUri;
      });  
    },
    setImg(img) {
      const container = this.$refs.captchaImgContainer;
      while (container.lastElementChild) container.removeChild(container.lastElementChild);

      container.appendChild(img);
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
