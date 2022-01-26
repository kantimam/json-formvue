<template>
  <v-chip close
          v-if="file"
          small
          :close-icon="$vuetify.icons.values.trashCanOutline"
          @click:close="removeFile">
    <v-progress-circular color="primary"
                         v-if="state === 'loading'"
                         :indeterminate="true"
                         :size="18"
                         :width="2"></v-progress-circular>
    <on-icon v-if="state === 'success'"
             color="success"
             size="18"
             icon="checkCircle"></on-icon>
    <on-icon v-if="state === 'error'"
             color="error"
             size="18"
             icon="alertCircle"></on-icon>
    <span class="v-chip__label">{{ file.name }}</span>
  </v-chip>
</template>

<script>
  import { VChip, VProgressCircular } from "vuetify/lib";
  import OnIcon from "../../basic/icon";

  export default {
    name: "OnFileUploadFile",
    components: {
      VChip,
      OnIcon,
      VProgressCircular
    },

    props: {
      color: {
        type: String,
        default: null
      },
      file: {
        default: undefined
      },
      index: {
        default: 0
      },
      state: {
        type: String,
        default: ''
      }
    },

    methods: {
      removeFile() {
        this.$parent.$emit('removeFile');
      }
    }
  };
</script>
