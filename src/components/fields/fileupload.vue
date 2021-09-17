<template>
  <div>
    <v-sheet
        bindex="0"
        title="Click to grap a file from your PC!"
        :color="dragIn? 'indigo lighten-4' : 'red'"
        width="100%"
        height="200"
        class="pa-2"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @dragover="handleDragOver"
        @drop="handleDrop"
        @click="handleDropZoneClick"
        ref="dropZoneRef"
    >
    </v-sheet>
    <v-file-input
      label="Click to select file or drop it into the panel above"
      show-size
      chips
      multiple
      ref="inputRef"
      v-model="files"
    ></v-file-input>
  </div>
</template>

<script>
export default {
  name: "fileupload",
  data() {
    return {
      files: [],
      dragIn: false,
    }
  },
  methods: {
    handleDragEnter(e){
      e.preventDefault()
      this.dragIn=true;
    },
    handleDragLeave(e){
      e.preventDefault()
      this.dragIn=false;
    },
    handleDragOver(e){
      e.preventDefault()
      this.dragIn=true;
    },
    handleDrop(e){
      this.dragIn=false;
      e.preventDefault()
      e.stopPropagation()
      const droppedFiles=e.dataTransfer.files;
      if(droppedFiles && droppedFiles.length){
        const fileArray=[];
        droppedFiles.forEach(file=>fileArray.push(file))
        console.log(fileArray)
        this.files=[...this.files, ...fileArray];
        e.dataTransfer.clearData()
      }
    },
    handleDropZoneClick(e){
      const nativInputElement=this.$refs.inputRef.$refs.input;
      if(nativInputElement){
        nativInputElement.click();
      }

    }
  },

}
</script>

<style scoped>

</style>