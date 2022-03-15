<script>
import {createInputRules, createRequiredLabel, isRequired,} from "../../lib/util";

export default {
  name: "BaseInput",
  props: {
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
    inputValue: {
      get() {
        return this.$store.getters.getCurrentInputValue(this.id) || "";
      },
      set(value) {
        this.$store.commit("updateInputValue", { key: this.id, value: value });
      },
    },
    inputError() {
      return this.$store.getters.getCurrentInputError(this.id) || "";
    },
  },
};
</script>
