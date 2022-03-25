import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class InputValueMixin extends Vue {
    @Prop({
        default: () => null
    })
    readonly value!: any

    get inputValue() {
        return this.value;
    }

    set inputValue(value: any) {
        this.$emit('input', value);
    }
}
