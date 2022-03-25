<script lang="ts">
import 'reflect-metadata' // infer vue prop type validation by ts-definition; import this before vue-property-decorator!
import {Component, Prop, Vue} from "vue-property-decorator";
import {createInputRules, createRequiredLabel, isRequired,} from "@/lib/util";
import {InputValidator} from "@/lib/FormDefinition";

const Props = Vue.extend({
  props: {
    identifier: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: null,
    },
    validators: {
      type: Array,
      required: false,
    },
    properties: {
      type: [Object, Array],
      required: true,
    },
  }
})

@Component<BaseInput>({
  name: "BaseInput",
})
export default class BaseInput extends Props {
  @Prop({
    default: () => []
  })
  readonly validators!: InputValidator[]

  get required() {
    return isRequired(this.properties);
  }

  get requiredLabel() {
    return createRequiredLabel(this.validators);
  }

  get inputRules() {
    return createInputRules(this.required, this.validators, this.properties);
  }

  get inputValue() {
    return this.$store.getters.getCurrentInputValue(this.identifier) || "";
  }

  set inputValue(value: any) {
    this.$store.commit("updateInputValue", {
      key: this.identifier,
      value: value
    });
  }

  get inputError() {
    return this.$store.getters.getCurrentInputError(this.identifier) || "";
  }
};
</script>
