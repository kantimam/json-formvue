<template>
  <div class="v-file-input__wrapper"
       v-bind:class="{ 'v-file-input--is-loading': loading }">
    <v-file-input :accept="accept"
                  @blur="blur"
                  @change="change"
                  @click.stop
                  :clearable="false"
                  :disabled="disabled"
                  :filled="filled"
                  @focus="focus"
                  :multiple="multiple"
                  :readonly="readonly"
                  :ref="'ref-' + id"
                  :rules="inputRules"
                  v-bind:class="{ 'v-file-input--is-hovered': dragged, 'v-text-field--required' : required, 'v-text-field--optional' : optional, 'v-input--upload-is-disabled' : disabledupload }"
                  :value="files">
      <div class="v-file-input__dropzone"
           slot="prepend-inner"
           @dragenter="dragenter"
           @dragleave="dragleave"
           @dragover="dragover"
           @drop="drop"
           @click.stop="click"
           ref="dropzone"></div>
      <template slot="label">
        <div v-if="required" class="v-input__label-required">{{ requiredLabel }}</div>
        <div v-if="optional" class="v-input__label-optional">{{ optionalLabel }}</div>
        <v-icon>upload</v-icon>
        <span>
            <slot name="label"></slot>
        </span>
      </template>
      <v-progress-linear :color="color"
                         :height="2"
                         indeterminate
                         slot="append"
                         v-if="loading"></v-progress-linear>
      <div @click.prevent v-if="files" slot="append-outer" class="v-file-upload__preview">
        <v-chip close
                small
                v-if="files.length > 1"
                :close-icon="$vuetify.icons.values.trashCanOutline"
                @click.prevent.stop="removeFile()"
                @click:close="removeFile()">{{ clearall }}</v-chip>

      </div>
    </v-file-input>
  </div>
</template>

<script>
import {VChip, VFileInput, VInput, VProgressCircular, VProgressLinear} from "vuetify/lib";
import {createInputRules, createRequiredLabel, isRequired} from "../../../lib/util";
//import './_file_upload.scss';


  export default {
    name: "OnFileUpload",
    components: {
      VInput,
      VChip,
      VProgressCircular,
      VFileInput,
      VProgressLinear
    },
    props: {
      accept: {
        type: String
      },
      clearall: {
        type: String,
        default: 'Clear all'
      },
      color: {
        type: String,
        default: null
      },
      disabled: {
        type: Boolean,
        default: false
      },
      disabledupload: {
        type: Boolean,
        default: false
      },
      filled: {
        type: Boolean,
        default: true
      },
      id: {
        type: String,
        required: true
      },
      loading: {
        type: Boolean,
        default: false
      },
      multiple: {
        type: Boolean,
        default: false
      },
      optional: {
        type: Boolean,
        default: false
      },
      optionalLabel: {
        type: String,
        default: 'optional'
      },
      readonly: {
        type: Boolean,
        default: false
      },

      rules: {
        type: [Object, Array],
        default() {
          return {} || [];
        }
      },
      value: {
        default: undefined
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
				  return this.$store.getters.getCurrentInputValue(this.id) || null;
			  },
			  set(value) {
				  this.$store.commit("updateInputValue", { key: this.id, value: value });
			  },
		  },
		  inputError() {
			  return this.$store.getters.getCurrentInputError(this.id) || "";
		  },
	  },

    data() {
      return {
        dragged: false,
        files: [],
        preserved: [],
        valid: true,
        preventTwiceChangeEvents: false
      }
    },

    model: {
      prop: 'value',
      event: 'change'
    },



    mounted() {
      let _scope = this;

      this.$refs['ref-' + this.id].$attrs.disabled = this.disabledupload;
      this.valid = this.$refs['ref-' + this.id].valid;

      // prevent fire on change event twice on native file upload
      this.$refs['ref-' + this.id].$refs.input.addEventListener('change', function () {
        _scope.preventTwiceChangeEvents = true;
      }, false);

      if(this.value) {
        this.preventOverride(this.value);
      }
    },

    watch: {
      disabledupload(disabledupload) {

        this.$nextTick(() => {
          this.$refs['ref-' + this.id].$attrs.disabled = disabledupload;
        });
      }
    },

    methods: {
      blur (e) {
        this.$emit("blur", e);

        // prevent validation on file upload
        // field looses its focus on click file upload
        if(e.sourceCapabilities === null && !this.files.length) {
          this.$refs['ref-' + this.id].resetValidation();
        }

        this.preventTwiceChangeEvents = false;
      },
      change (e) {
        if(!this.preventTwiceChangeEvents) {
          let arr = [];

          e.forEach(file => {
            // prevent wrong file type upload
            if(this.accept.includes(file.type)) {
              arr.push(file);
            }
          });

          this.preventOverride(arr);
          this.$emit("change", this.files);

          this.$refs['ref-' + this.id].blur();
        }
      },
      click () {
        if(!this.readonly && this.$refs['ref-' + this.id].$refs.input && !this.disabledupload) {
          this.$refs['ref-' + this.id].$refs.input.click();
        }
      },
      dragenter (e) {
        e.preventDefault();
        this.dragged = true;
      },
      dragleave (e) {
        e.preventDefault();
        this.dragged = false;
      },
      dragover (e) {
        e.preventDefault();
        this.dragged = true;
      },
      drop (e) {
        this.dragged = false;
        e.preventDefault();
        e.stopPropagation();

        let droppedFiles = e.dataTransfer.files,
            arr = [];

        if(!this.disabledupload && droppedFiles && droppedFiles.length) {
          droppedFiles.forEach(file => {
            // prevent wrong file type upload
            if(this.accept.includes(file.type)) {
              arr.push(file);
            }
          });

          this.preventOverride(arr);
          e.dataTransfer.clearData();

          this.$emit("change", this.files);
        }
      },
      focus (e) {
        this.$emit("focus", e);
      },
      preventOverride (selectedfiles) {
        if(this.multiple) {
          this.files = [];

          if(this.preserved.length) {
            this.files = this.preserved.concat(selectedfiles);
            this.files = this.files.filter((file, index, self) =>
              index === self.findIndex((f) => (
                f.name === file.name
              ))
            );
          } else {
            this.files = selectedfiles;
          }

          this.preserved = this.files;
        } else {

          if(selectedfiles instanceof Array === false) {
            this.files = [];
            this.files.push(selectedfiles);
          }
        }

        this.valid = this.$refs['ref-' + this.id].valid;
      },
      removeFile(index) {

        if(index > -1) {
          this.$emit("remove", this.files[index]);
          this.files.splice(index, 1);
        } else {
          this.$emit("remove", this.files);
          this.files = [];
        }

        this.preserved = this.files;
        this.$emit("change", this.files);
      }
    }
  };
  /*
  <template v-for="(file, index) in files">
          <on-event-listener @removeFile="removeFile(index)">
              <slot name="file"
                    :file="file"></slot>
          </on-event-listener>
        </template>
   */
</script>
