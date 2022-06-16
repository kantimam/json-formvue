import {VTextField} from "vuetify/lib/components";
import OnTextFieldMasked from '@/components/fields/composed/textfield_masked'
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {createDummyValidator, defaultProps} from "@/stories/helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-text-field', VTextField)

export default {
    title: 'Formvue/Composed/TextFieldMasked',
    component: OnTextFieldMasked,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {TextField: OnTextFieldMasked},
    template: '<text-field v-bind="$props" />',
    provide() {
        return {
            validatorsMap: {}
        }
    }
});

export const Default = Template.bind({});

const defProps = defaultProps('Masked Input', 'text-input', false, false);
defProps.properties.pattern = 'CC00 XXXX XXXX XXXX XXXX XX';
defProps.properties.placeholder = '_'

Default.args = defProps;
Default.storyName = 'Optional'

export const Complete = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
const comProps = defaultProps('Masked Input', 'text-input', false, false);
comProps.properties.pattern = 'CC00 XXXX XXXX XXXX XXXX XX';
comProps.properties.placeholder = '_'
comProps.validators = [createDummyValidator('MaskComplete', 'Please complete your input')];

Complete.args = comProps;

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
const reqProps = defaultProps('Masked Input', 'text-input', false, true);
reqProps.properties.pattern = 'CC00 XXXX XXXX XXXX XXXX XX';
reqProps.properties.placeholder = '_'
reqProps.validators.push(createDummyValidator('MaskComplete', 'Please complete your input'));

Required.args = reqProps;
