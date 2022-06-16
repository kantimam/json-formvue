import {Component, Prop, Vue} from "vue-property-decorator";

/**
 * Use on components, which should be controlled by v-model.
 * The internal value of inputValue is entirely controlled by the parent, passing the 'value' prop.
 * Parent components may use this mixin themselves and override the getter / setter.
 */
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
