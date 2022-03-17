<script>
import {
  createInputRules,
  isRequired,
  createRequiredLabel,
} from "../../lib/util";

export default {
  name: "BaseInput",
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
        return this.$store.getters.getCurrentInputValue(this.identifier) || "";
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
