<template>
  <masked-text
      v-bind="$attrs"
      :properties="properties"
      :mask-active="maskActive"
      v-on="$listeners"
      type="tel"
  />
</template>
<script lang="ts">
import MaskedText from "./textfield_masked.vue";
import {Component, Prop} from "vue-property-decorator";
import {mixins} from "vue-class-component";
import InputValueMixin from "@/components/mixin/InputValueMixin";
import {ElementProperties} from "@/lib/FormDefinition";

@Component<OnTextFieldTelephone>({
  name: "OnTextfieldTelephone",
  components: {
    MaskedText,
  },
})
export default class OnTextFieldTelephone extends mixins(InputValueMixin) {
  @Prop()
  readonly properties!: ElementProperties

  get maskActive() {
    return !!this.properties.pattern && this.properties.pattern.length > 0;
  }
};
</script>
