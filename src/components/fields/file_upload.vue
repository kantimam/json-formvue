<template>
  <div
    :class="
      ({
        'ondigo-file-drop': showDropZone,
        'ondigo-file-multiple': allowMultiple,
      },
      'ondigo-file-wrapper')
    "
  >
    <v-sheet
      v-if="showDropZone"
      bindex="0"
      :title="dropZoneTitle"
      width="100%"
      height="200"
      rounded
      :class="({ 'ondigo-drop-inside': dragIn }, 'ondigo-drop')"
      @dragenter.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      @dragover.prevent="handleDragOver"
      @drop.prevent="handleDrop"
      @click="handleDropZoneClick"
      ref="dropZoneRef"
    >
    </v-sheet>
    <v-file-input
      :accept="allowedMimeTypes"
      :required="required"
      class="ondigo-file-input"
      counter
      :identifier="identifier"
      :label="label"
      :name="name"
      :rules="inputRules"
      show-size
      :chips="allowMultiple"
      :multiple="allowMultiple"
      ref="inputRef"
      v-model="inputValue"
      persistent-hint
      :hint="inputDescription"
      :filled="filled"
      :error-messages="inputError"
	  prepend-icon=""
	  append-icon="mdi-paperclip"
    ></v-file-input>
  </div>
</template>

<script>
import {createInputRules, createRequiredLabel, isRequired,} from "../../lib/util";

export default {
  name: "fileUpload",
  props: {
    // required base props
    identifier: {
      type: String,
      required: true,
    },
    filled: {
      type: Boolean,
    },
    label: {
      type: String,
      required: true,
      default: "Click to upload file",
    },
    name: {
      type: String,
      required: true,
    },
    validators: {
      type: Array,
      required: false,
    },
    properties: {
      type: Object | Array,
      required: true,
    },
    // specific file upload props
    showDropZone: {
      type: Boolean,
      default: true,
    },
    dropZoneTitle: {
      type: String,
      default: "drag files into drop zone or click to select",
    },
    allowMultiple: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dragIn: false,
    };
  },
  methods: {
    handleDragEnter() {
      // man könnte hier schon die größe und file type validieren
      this.dragIn = true;
    },
    handleDragLeave() {
      this.dragIn = false;
    },
    handleDragOver() {
      this.dragIn = true;
    },
    handleDrop(e) {
      this.dragIn = false;
      e.stopPropagation();
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles instanceof FileList) {
        if (this.allowMultiple) {
          const fileArray = [];
          let index = 0;
          const itemsCount = droppedFiles.length;
          for (index; index < itemsCount; index++) {
            fileArray.push(droppedFiles[index]);
          }
          this.inputValue = [...this.files, ...fileArray];
          e.dataTransfer.clearData();
        } else {
          this.inputValue = droppedFiles[0];
        }
      }
    },
    handleDropZoneClick() {
      const nativeInputElement = this.$refs.inputRef.$refs.input;
      if (nativeInputElement) {
        nativeInputElement.click();
      }
    },
  },
  computed: {
    required() {
      return isRequired(this.properties);
    },
    requiredLabel() {
      return createRequiredLabel(this.validators);
    },
    inputRules() {
      return createInputRules(this.required, this.validators, this.properties);
    },
    inputDescription() {
      return this.properties?.elementDescription || "";
    },
    allowedMimeTypes() {
      return this.properties?.allowedMimeTypes || null;
    },
    inputValue: {
      get() {
        return this.$store.getters.getCurrentInputValue(this.identifier) || null;
      },
      set(value) {
        this.$store.commit("updateInputValue", { key: this.identifier, value: value });
      },
    },
    inputError() {
      return this.$store.getters.getCurrentInputError(this.identifier) || "";
    },
  },
};
</script>
